const nodemailer = require('nodemailer');

const sendResetEmail =async options =>{

    const transpoter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,

        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions ={
        from:'Saffar subedi <azajsbd111@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message
    }

      await transpoter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
})
}

module.exports=sendResetEmail;