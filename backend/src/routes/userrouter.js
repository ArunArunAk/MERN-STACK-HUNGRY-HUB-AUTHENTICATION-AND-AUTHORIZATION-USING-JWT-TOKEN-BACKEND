const express = require("express");
const router=express.Router();


const controller=require('../controller/usercontroller')



router.post('/singup',controller.Adduser)
router.post('/singin',controller.login)
router.post('/email',controller.sendEmail)
router.patch('/updatepassword',controller.resetpassword)

router.get('/verify',controller.verifyuser,controller.verify)
router.get('/logout',controller.logout)





module.exports=router;


