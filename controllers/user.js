const User = require("./../models/userModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { ObjectId } = require("mongodb");
const catchAsync = require("./../utils/catchAsync");

//get user data by id
exports.getSignedUser = async (req, res, next) => {
  try {
  
    const user = await User.find({ _id: ObjectId(req.userId) });

    res.status(200).json({
      status: "success",

      data: user[0],
    });
  } catch (error) {
    next(error);
  }
};

//get user status by email
exports.getUserStatus = catchAsync(async (req, res, next) => {
  const { email } = req.params;

  //1. create error if if email not received
  if (!email) {
    const error = new Error("This request requires email in params.");
    error.statusCode = 400;
    throw error;
  }

  //2. find user by email
  const user = await User.find({
    email: email,
  });

 

  if (!user.length) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  //3. user found, sending response
  const [userObj] = [...user];

  const { active } = userObj;

  res.status(200).json({
    status: "success",
    email: email,
    active: active,
  });
});

//create company/location
exports.createCompany = catchAsync(async (req, res, next) => {
  // receive data.
  const { timeZone, companyName } = req.body;
  const userID = req.userId;
  // validate received fields
  const user = await User.findById(userID);
  // charge in stripe
  const productID = process.env.STRIPE_PRODUCT;
  const subscription = await stripe.subscriptions.create({
    customer: user.stripeCustomerID,
    items: [{ price: productID }],
  });

  // insert new company into database
  const update = await User.findOneAndUpdate(
    { _id: new ObjectId(userID) },
    {
      $push: {
        companies: {
          name: companyName,
          timeZone: timeZone,
          stripeSubscriptionID: subscription.id,
        },
      },
    }
  );
  // getting updated state of user
  const latestUser = await User.findById(userID);

  // send response
  res.status(201).json({
    status: "success",
    data: {
      user: latestUser,
    },
  });
});

//get company
exports.getCompany = catchAsync(async (req, res, next) => {
  //receive company ID
  const companyID = req.params.companyId;
  const userID = req.userId;

  //check if company belongs to the user
  const user = await User.find(
    {
      _id: new ObjectId(userID),
      companies: {
        $elemMatch: { _id: new ObjectId(companyID) },
      },
    },
    { "companies.$": 1 }
  );

  if (!user.length) {
    res.status(404).json({
      status: "error",
      message: "Company Not Found",
    });
  }

  //get company details from stripe

  const company = user[0].companies[0];
  const { stripeSubscriptionID } = company;
  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionID
  );
  const { current_period_end, cancel_at_period_end, status } = subscription;

  //send response
  res.status(200).json({
    status: "success",
    data: {
      current_period_end,
      cancel_at_period_end,
      status,
    },
  });
});

//toggle auto renewal for company
exports.toggleRenewal = catchAsync(async (req, res, next) => {
  //receive company ID
  const companyID = req.params.companyId;
  const userID = req.userId;

  //check if company belongs to the user
  const user = await User.find(
    {
      _id: new ObjectId(userID),
      companies: {
        $elemMatch: { _id: new ObjectId(companyID) },
      },
    },
    { "companies.$": 1 }
  );

  if (!user.length) {
    res.status(404).json({
      status: "error",
      message: "Company Not Found",
    });
  }
  //get company details from stripe

  const company = user[0].companies[0];
  const { stripeSubscriptionID } = company;
  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionID
  );
  const { cancel_at_period_end } = subscription;
  //change/toggle subscription status
  const toggleSubscription = await stripe.subscriptions.update(
    stripeSubscriptionID,
    { cancel_at_period_end: !cancel_at_period_end }
  );
  const {
    current_period_end,
    cancel_at_period_end: new_cancel_at_period_end,
    status,
  } = toggleSubscription;

  //send response
  res.status(200).json({
    status: "success",
    data: {
      current_period_end,
      cancel_at_period_end,
      new_cancel_at_period_end,
      status,
    },
  });
});
