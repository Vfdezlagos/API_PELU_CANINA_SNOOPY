import nodemailer from 'nodemailer';
import config from "../config.js";


const transporter = nodemailer.createTransport({
    host: config.MAILER_HOST,
    port: config.MAILER_PORT,
    secure: true,
    auth: {
        user: config.EMAIL,
        pass: config.EMAIL_SECRET_PASS
    }
});

const sendEmail = async (options) => {
    try {
        const response = await transporter.sendMail({
            from: config.EMAIL,
            to: options.to,
            subject: options.subject,
            text: options.text || '',
            html: options.html || '',
            attachments: options.attachments || []
        });

        console.log('Email enviado', response);
    }catch(error){
        console.log('No se pudo mandar el EMAIL', error);
    }
}

export default sendEmail;