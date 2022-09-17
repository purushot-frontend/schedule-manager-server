module.exports = (fn) => {
  return (req, res, next) => {

    fn(req, res, next).catch(next);
  };
};

// const catchAsync = (funx) => {
//   return async (val) => {
//     try {
//       funx(val);
//     } catch (error) {
//       console.log(error);
//     }
//   };
// };
