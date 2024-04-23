import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('nodemailer_server_host'),
      port: this.configService.get('nodemailer_server_port'),
      secure: false,
      auth: {
        user: this.configService.get('nodemailer_server_user'),
        pass: this.configService.get('nodemailer_server_pass'),
      },
    });
  }
  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: this.configService.get('nodemailer_server_user'),
      },
      to,
      subject,
      html,
    });
  }
}
