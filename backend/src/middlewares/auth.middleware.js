import validator from "validator";

export const validateSignup = (req, res, next) => {
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (fullName.replace(/\s/g, "").length < 3) {
    return res.status(400).json({
      message: "Full name must be at least 3 letters long",
    });
  }

  if (!/^[\p{L} '-]+$/u.test(fullName)) {
    return res.status(400).json({
      message:
        "Full name may only contain letters, spaces, hyphens, or apostrophes",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  next();
};
