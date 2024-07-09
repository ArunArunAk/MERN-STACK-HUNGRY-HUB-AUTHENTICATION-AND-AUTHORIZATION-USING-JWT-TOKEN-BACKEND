const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const usermodel = require("../models/User");
const UserToken = require("../models/usertoken.model");

const Adduser = async (req, res) => {
  const { firstname, secondname, email, password } = req.body;
  console.log(firstname, secondname, email, password);

  const useralready = await usermodel.findOne({ email });

  if (useralready) {
    return res.status(409).json({ message: "User already existed" });
  }

  const salt = await bcrypt.genSalt(10);
  console.log(salt, "salt");
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new usermodel({
    firstname,
    secondname,
    email,
    password: hashedPassword,
  });

  try {
    await user.save();
    res.status(200).send({
      status: true,
      message: "user created ....!",
    });
  } catch (error) {
    console.log("errorru");
    console.error(error);

    res.status(400).send(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usermodel.findOne({ email: req.body.email });
    console.log("hththtthth");

    if (!user) {
      return res.status(409).send({
        status: false,
        message: "Email is not found",
      });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).send({
        status: false,
        message: "Invalid password",
      });
    }

    //JWT Token
    const usernamed = user.firstname;
    const userId = user._id;
    const accessToken = jwt.sign(
      { id: userId, firstname: usernamed },
      process.env.ACCESS_TOKEN,
      { expiresIn: "10m" }
    );

    // Axios.defaults.withCredentials=true; //ur cookie need in react frontebd add this axios make true

    res
      .cookie("token", accessToken, {
        httpOnly: true,
        maxAge: 600000, // 10 minutes in milliseconds after 10 minute automatically reamove from coolies
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json({
        status: 200,
        message: "Login successful",
        data: user,
      });
  } catch (error) {
    console.error("aaaaaaaaaa", error);
    res.status(500).send(error);
  }
};

const verifyuser = async (req, res, next) => {
  console.log("enter middleware");

  try {
    const token = req.cookies.token;

    console.log("Token in middleware:", token);

    if (!token) {
      return res.json({
        status: false,
        message: "No token",
      });
    }
    const decode = await jwt.verify(token, process.env.ACCESS_TOKEN);
    console.log("Token decoded:", decode);
    req.user = decode; // Store decoded token in request object
    next();
  } catch (error) {
    console.log("Token verification error:", error);
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }
};

const verify = (req, res) => {
  return res.json({
    status: true,
    message: "Authorized",
    user: req.user, // Assuming req.user contains user info
  });
};

const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({
    status: true,
    message: "Logout successfully",
  });
};

const sendEmail = async (req, res) => {
  const email = req.body.email;
  console.log(email);
  const user = await usermodel.findOne({
    email: { $regex: "^" + email + "$", $options: "i" },
  });

  if (!user) {
    return res.status(404).send({
      status: false,
      message: "email is not exists",
    });
  }

  const payload = {
    email: user.email,
    id: user._id,
  };

  const expirytime = 3000;
  const Token = jwt.sign(payload, process.env.ACCESS_TOKEN, {
    expiresIn: "10m",
  });

  //  const newToken=new UserToken({
  //     userId:user._id,
  //     token:Token
  //  })

  let mailtransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arunarun2gs@gmail.com",
      pass: "hooc dwdf esgn gtzp",
    },
  });
  let maildetails = {
    from: "arunarun2gs@gmail.com",
    to: "arunarun2gs@gmail.com", // make sure to replace this with the actual recipient's email
    // to:email
    subject: "Reset Password From HungryHub",
    html: `
          <html>
            <head>
              <style>
                .button {
                   background-color: #4CAF50; /* Green */
                  border: none;
                  color: white;
                  padding: 15px 32px;
                  text-align: center;
                  text-decoration: none;
                  display: inline-block;
                  font-size: 16px;
                  margin: 4px 2px;
                  cursor: pointer;
                }
                
              </style>
            </head>
            <body>
              <h1>Password Reset Request</h1>
              <p>${user.username}</P>
              <p>We received your request for a password reset at HungryHub. Please click the button
               below to proceed:</p>
              <a href=${process.env.LIVE_URL}/updatepassword/${Token} class="button">Reset Password</a>
            </body>
          </html>`,
  };

  mailtransporter.sendMail(maildetails, async (error, info) => {
    if (error) {
      console.log(error);
      return res.status(400).json({
        status: false,
        message: "email not sent ",
      });
    } else {
      // await newToken.save()
      console.log("Email sent: " + info.response);

      return res.status(200).json({
        status: true,
        message: "mail sent successful",
      });
    }
  });
};

// const resetpassword = async (req, res) => {
  //code wrong 
//   const token = req.body.token;
//   const newPassword = req.body.newPassword;
//   console.log(token, "tooooken");
//   console.log(newPassword, "passsssword");

//   jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
//     if (err) {
//       console.error("Token verification error:", err);

//       return res.status(403).send({
//         message: "Reset Link Is Expired",
//       });
//     } else {
//       const response = decoded;
//       console.log("reset-token", response);
    

//       const user = await usermodel.findOne({
//         email: { $regex: "^" + response.email + "$", $options: "i" },
//       });

//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(newPassword, salt);
//       console.log(hashedPassword,'hashedPassword')

//       user.password = hashedPassword;
//       try {
//         const updateuser = await usermodel.findByIdAndUpdate(
//           { _id: user._id },
//           { $set: user },
//           { new: true }
//         );

//         return res.status(201).json({
//           status: true,
//           message: "password update succesfully ",
//         });
//       } catch (error) {
//         return res.status(400).json({
//           status: false,
//           message: "password not update succesfully,it have problem ",
//         });
//       }
//     }
//   });
// };
const resetpassword = async (req, res) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;
  console.log(token, "tooooken");
  console.log(newPassword, "passsssword");

  jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).send({
        message: "Reset Link Is Expired",
      });
    } else {
      const response = decoded;
      console.log("reset-token", response);

      try {
        // const user = await usermodel.findOne({
        //   email: { $regex: "^" + response.email + "$", $options: "i" },
        // });

        // if (!user) {
        //   return res.status(404).json({
        //     status: false,
        //     message: "User not found for this email",
        //   });
        // }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log(hashedPassword, "hashedPassword");

        // user.password = hashedPassword;
        console.log(user)
        const updateuser = await usermodel.findByIdAndUpdate(
          { _id: user._id },
          { $set: { password: hashedPassword } },
          { new: true }
        );

        return res.status(201).json({
          status: true,
          message: "Password updated successfully",
        });
      } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({
          status: false,
          message: "Internal server error",
        });
      }
    }
  });
};


// const sendEmailanotherformate = async (req, res) => {
//   const email=req.body.email;

//   try{
//     const user = await usermodel.findOne({ email:{$regex:'^'+email+'$',$options:'i'  }});
//     if(!user){
//             return res.status(404).send({
//                 status: false,
//                 message: "email is not exists"
//             });

//      }

//      const Token = jwt.sign({id:user._id}, process.env.ACCESS_TOKEN, { expiresIn: '10m' });
//      var transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'arunarun2gs@gmail.com',
//         pass: 'hooc dwdf esgn gtzp'
//       }
//     });

//     var mailOptions = {
//       from: 'youremail@gmail.com',
//       to: 'arunarun2gs@gmail.com',  // make sure to replace this with the actual recipient's email
//       subject: 'Reset Passworf From Humgry Hub',
//       text: 'http://localhost:3000/updatepassword/${Token}'
//     };

//     transporter.sendMail(mailOptions, function(error, info){
//       if (error) {
//         console.log(error);
//       } else {
//         console.log('Email sent: ' + info.response);
//       }
//     });

//   }catch(error){
//        console.log(error)
//   }

// }

module.exports = {
  Adduser,
  login,
  sendEmail,
  verify,
  verifyuser,
  logout,
  resetpassword
};
