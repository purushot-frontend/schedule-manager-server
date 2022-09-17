require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { ObjectId } = require("mongodb");
const { validationResult } = require("express-validator");
const User = require("./../models/userModel");
const Email = require("./../utils/email");
const catchAsync = require("./../utils/catchAsync");

exports.signUp = async (req, res, next) => {
  try {
    //Deleting Invalid User With Same Email If Exists.
    const invalidUser = await User.deleteOne({
      $and: [{ email: req.body.email }, { active: false }],
    });


    if (!req.body.token) {
      const error = new Error("Invalid stripe token.");
      error.statusCode = 400;
      throw error;
    }

    //Hashing the password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    //Creating New User
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
      passwordConfirm: req.body.confirmPassword,
      active: false,
    });

    //Create customer in stripe
    const customer = await stripe.customers.create({
      email: req.body.email,
      name: req.body.fullName,
      source: req.body.token,
    });

    //update user with stripe response
    const update = await User.findOneAndUpdate(
      { _id: ObjectId(newUser._id) },
      {
        stripeCustomerID: customer.id,
        $push: {
          companies: {
            name: req.body.companyName,
            timeZone: req.body.timeZone,
          },
        },
      }
    );

    const url = `${process.env.CLIENT_URL}/verifyAccount?email=${newUser.email}&activationToken=${newUser.activationToken}`;

    await new Email(newUser, url).sendActivationEmail();

    res
      .status(200)
      .json({ status: "success", newUser, customerID: customer.id, url });
  } catch (error) {
    next(error);
  }
};

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = { ...req.body };

  const user = await User.findOne({ email });

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    //   res.status(400).json({
    //     status: "failure",
    //     message: "Invalid Password.",
    //   });
    //   return next();
    const error = new Error("Invalid Password");
    error.statusCode = 400;
    throw error;
  }

  //creating temporary jwt token
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
  //receiving & validating datas
  const { email, activationToken } = req.body;
  if (!(email && activationToken)) {
    const error = new Error(
      "This request requires email & activationToken in body."
    );
    error.statusCode = 400;
    throw error;
  }

  //1. retrieve user based on email,activationToken,active
  const user = await User.find({
    email: email,
    activationToken,
    active: false,
  });

  //check if valid user
  if (!user.length) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const [userObj] = [...user];

  //2. charge in stripe
  const productID = process.env.STRIPE_PRODUCT;
  const subscription = await stripe.subscriptions.create({
    customer: userObj.stripeCustomerID,
    items: [{ price: productID }],
  });

  //3. activate account
  const updateUser = await User.findOneAndUpdate(
    {
      _id: new ObjectId(userObj._id),
      "companies._id": new ObjectId(userObj.companies[0]._id),
    },
    {
      active: true,
      $set: { "companies.$.stripeSubscriptionID": subscription.id },
    }
  );
  //4. send response
  res.status(200).json({
    status: "success",
    message: "Account verified successfully! You can now login.",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    throw new Error("You are not logged in! Please log in to get access.");
  }

  // 2) Verification token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  // const decodedToken = await promisify(jwt.verify)(
  //   token,
  //   "some"
  // );

  // 3) Check if user still exists
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    throw new Error("The user belonging to this token does no longer exist.");
  }

  // 4) setting user id
  req.userId = decodedToken.id;
  next();
});

exports.protectCompany = catchAsync(async (req, res, next) => {
  companyId = req.headers.company;
  if (!companyId) {
    throw new Error("Company ID is required in header for further access.");
  }

  //Check if company belongs to user.
  const company = await User.findOne(
    {
      $and: [
        { _id: ObjectId(req.userId) },
        {
          companies: {
            $elemMatch: { _id: ObjectId(companyId) },
          },
        },
      ],
    },
    { "companies.$": 1 }
  );

  if (!company) {
    throw new Error("Company Not Found.");
  }

  req.company = company.companies[0];
  next();
});
