const fs = require("fs");
const path = require("path");

const ejs = require("ejs");
const nodemailer = require("nodemailer");

const env = require("../utils/env.js");
const config = require("../utils/config.js");
const civilities = require("../constants/civilities.js");

const {isEmailValid} = require("../utils/index.js");
const {
  DOCUMENTS,
  TEMPLATES,
} = require("../utils/paths.js");

const {logger} = require("./logger.js");
const tokenSrv = require("./token.js");

const emails = config.emails[env];
const transporter = nodemailer.createTransport(config.mailer);

const BASE = config.base[env];
const CONFIRM_BASE = `${BASE}/new-password/?token=`;
const CONFIRM_CONTRIBUTOR = `${BASE}/confirmation/?token=`;

const from = `EDWIN <${emails.contact}>`;
const mailTemplate = [
  {key: "confirmation", template: "mail_confirmation.ejs"},
  {key: "passwordReset", template: "mail_password_reset.ejs"},
].reduce((acc, cur) => {
  acc[cur.key] = ejs.compile(fs.readFileSync(path.join(TEMPLATES, cur.template), "utf8"));
  return acc;
}, {});

const sendMailP = options => new Promise((resolve, reject) => {
  if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
    logger.info("Message not send due to no recipient provided");
    return resolve();
  }
  transporter.sendMail(options, (error, mail) => {
    if (error) {
      return reject(error);
    }
    logger.info("Message=[%s] sent=[%s] to=[%s]", mail.messageId, mail.response, options.to);
    resolve(mail);
  });
});

const mailSrv = {};

mailSrv.getAccessLink = (query, base = ACCESS_BASE) => {
  const search = new URLSearchParams(query).toString();
  return search ? `${base}/?${search}` : base;
};

mailSrv.sendContributorConfirmationEmail = async (society, contributor) => {
  if (society.status !== SocietyStatus.ENABLED
    || (society.parent && society.parent.status !== SocietyStatus.ENABLED)) {
    logger.info("Not sending email to user=[%s] from society=[%s]", contributor.id, society.id);
    return;
  }
  logger.info("Send confirmation email to contributor=[%s]", contributor.id);
  // create token for user to access to study
  const token = tokenSrv.confirmOperator(contributor);
  // build mail from template
  const data = {
    name: `${contributor.firstName} ${contributor.lastName}`,
    email: contributor.email,
    link: `${CONFIRM_CONTRIBUTOR}${token}`,
    icon: ICON,
  };
  // setup email data with unicode symbols
  const mailOptions = {
    from,
    to: contributor.email,
    subject: "Confirmation de création de votre compte contributeur sur la plateforme EDWIN",
    text: "Confirmation de création de votre compte entreprise sur la plateforme EDWIN",
    html: mailTemplate.confirmationOperateur(data),
  };
  await sendMailP(mailOptions);
};

/* eslint-disable-next-line id-length */
mailSrv.sendSocietyContributorConfirmationEmail = async (society, contributor) => {
  if (society.status !== SocietyStatus.ENABLED
    || (society.parent && society.parent.status !== SocietyStatus.ENABLED)) {
    logger.info("Not sending email to user=[%s] from society=[%s]", contributor.id, society.id);
    return;
  }
  logger.info(
    "Send confirmation email to user=[%s] from society=[%s]",
    contributor.id,
    society.id,
  );
  const token = tokenSrv.confirmContributor(contributor);
  const link = `${CONFIRM_BASE}${token}`;
  const data = {
    name: contributor.name,
    society: society.employer,
    email: contributor.email,
    link,
    icon: ICON,
  };
  const text = [
    `Bonjour ${contributor.name},`,
    /* eslint-disable-next-line max-len */
    `Un compte pour la société ${society.employer} a été créé sur la plateforme EDWIN avec l'addresse email ${contributor.email}.`,
    "Copiez/collez le lien suivant dans votre navigateur pour valider la création de votre compte.",
    link,
  ].join("\n");
  // setup email data with unicode symbols
  const mailOptions = {
    from,
    to: contributor.email,
    subject: "Confirmation de création de votre compte sur la plateforme EDWIN",
    text,
    html: mailTemplate.confirmation(data),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendPasswordResetEmail = async (email, token) => {
  logger.info("Send password reset email, to email=[%s]", email);
  const link = `${CONFIRM_BASE}${token}`;
  const data = {email, link, icon: ICON};
  const text = [
    "Bonjour,",
    "Vous recevez cet email car une demande de réinitialisation de mot de passe pour cet email a été demandé.",
    "Si vous n'êtes pas à l'origine de cet email, ignore ce dernier. Sinon, copiez/collez le lien suivant dans votre navigateur pour changer votre de mot passe.",
    link,
  ].join("\n");
  const mailOptions = {
    from,
    to: email,
    subject: "EDWIN - Réinitialisation de mot de passe",
    text,
    html: mailTemplate.passwordReset(data),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendOperationMail = async (operation, contributor, data) => {
  logger.info("Send email to contributor=[%s] of operation=[%s]", contributor.id, operation.id);
  const mailOptions = {
    from,
    to: contributor.email,
    subject: data.subject,
    html: mailTemplate.operation({icon: ICON, ...data.content}),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendBonTravailCreationMail = async (representant, id) => {
  logger.info("Send email to representant=[%s} for doc=[%s]", representant.email, id);
  const email = representant.email;
  const link = `${BONTRAVAILINSTALLATION}${id}/edit`;
  const text = [
    "Bonjour,",
    "Veuillez valider le bon de travail de l'entreprise intervenante.",
    link,
  ].join("\n");
  const data = {
    email,
    accessLink: link,
    icon: ICON,
    lastName: representant.lastName,
    civility: representant.civility,
    text,
  };
  const subject = "Un nouveau document est prêt à être vérifié";
  const mailOptions = {
    from,
    to: email,
    subject,
    text,
    html: mailTemplate.bonTravailInstallation({icon: ICON, ...data}),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendHabilitationMail = async (
  contributorHabilitation,
  contributor,
  consultation = false,
) => {
  logger.info("Send mail for habilitation=[%s] signature for [%s]", contributorHabilitation.id, contributor.id);
  const cId = contributorHabilitation.contributor.id;
  const accessLink = cId === contributor.id
    ? mailSrv.getAccessLink({
      token: tokenSrv.operator({id: contributor.societyId}, contributor),
      habilitation: contributorHabilitation.id,
      to: consultation ? "current" : "sign",
    })
    : mailSrv.getAccessLink(null, HABILITATION(contributorHabilitation));
  const email = contributor.email;
  /* eslint-disable max-len */
  const content = consultation
    ? `L'habilitation de ${contributorHabilitation.contributor.firstName} ${contributorHabilitation.contributor.lastName} à été mise à jour, rendez-vous sur la plateform edwin.`
    : `L'habilitation de ${contributorHabilitation.contributor.firstName} ${contributorHabilitation.contributor.lastName} est disponible pour signature, rendez-vous sur la plateform edwin.`;
  /* eslint-enable max-len */
  const text = [
    `Bonjour ${civilities[contributor.civility].short} ${contributor.lastName}`,
    "",
    content,
    "",
    "Copiez/collez le lien suivant dans votre navigateur pour accéder à l'habilitation.",
    accessLink,
  ].join("\n");
  const data = {
    email,
    civility: civilities[contributor.civility].short,
    lastName: contributor.lastName,
    text: content,
    accessLink,
    icon: ICON,
  };

  const mailOptions = {
    from,
    to: email,
    text,
    /* eslint-disable max-len */
    subject: consultation
      ? `EDWIN - Habilitation ${contributorHabilitation.contributor.lastName} ${contributorHabilitation.contributor.firstName} mise à jour`
      : `EDWIN - Habilitation ${contributorHabilitation.contributor.lastName} ${contributorHabilitation.contributor.firstName} à signer`,
    /* eslint-enable max-len */
    html: mailTemplate.habilitation(data),
  };

  const res = await sendMailP(mailOptions);
  return res;
};

mailSrv.sendHabilitationAlertMail = async (recipients, count, relativeTime, months) => {
  const destEmails = Object.keys(recipients);
  logger.info("Send %s mail(s) for %s nearly expired habilitation(s)", destEmails.length, count);
  const accessLink = mailSrv.getAccessLink(
    {expiresIn: months, forMe: true},
    HABILITATION_LIST,
  );
  const success = 0;
  let errors = 0;
  for (const to of destEmails) {
    const recipient = recipients[to].contributor;
    const content = [
      `Les habilitations des opérateurs suivants arrivent à expirations ${relativeTime} :`,
      ...recipients[to].contributors
        .map(e => `- ${civilities[e.civility].short} ${e.firstName} ${e.lastName}`),
      accessLink,
    ].join("\n");
    const text = [
      `Bonjour ${civilities[recipient.civility].short} ${recipient.lastName}`,
      "",
      content,
      "",
      "Copiez/collez le lien suivant dans votre navigateur pour accéder à la liste d'habilitations.",
    ].join("\n");
    const data = {
      email: to,
      civility: civilities[recipient.civility].short,
      lastName: recipient.lastName,
      text: content.replace(/\n/gu, "<br>"),
      accessLink,
      icon: ICON,
    };

    const mailOptions = {
      from,
      to,
      text,
      subject: `EDWIN - ${recipients[to].contributors.length} Habilitation(s) à renouveler`,
      html: mailTemplate.habilitation(data),
    };

    try {
      await sendMailP(mailOptions);
    } catch (error) {
      logger.error(error);
      errors++;
    }
  }
  logger.info(`Sent successfully ${success} email(s) and had ${errors} error(s).`);
};

mailSrv.sendBonTravailUpdated = async (document, data, itsts) => {
  logger.info("Send mails to [%s] for documents [%s]", data.to, document.id);

  const attachments = [];
  // eslint-disable-next-line camelcase
  const schema_file = document.data.operation.schema_file;
  // eslint-disable-next-line camelcase
  const description_file = document.data.operation.description_file;
  attachments.push({ // stream as an attachment
    filename: `${document.name}: ${document.data.reference}.pdf`,
    content: fs.createReadStream(path.join(DOCUMENTS, document.path)),
  });
  // eslint-disable-next-line camelcase
  if (schema_file) {
    const extensionRegex = /(?:\.([^.]+))?$/;
    // eslint-disable-next-line camelcase
    const fileName = `${schema_file.name}${extensionRegex.exec(schema_file.path)[0]}`;
    attachments.push({
      filename: fileName,
      content: fs.createReadStream(path.join(DOCUMENTS, document.data.operation.schema_file.path)),
    });
  }
  // eslint-disable-next-line camelcase
  if (description_file) {
    const extensionRegex = /(?:\.([^.]+))?$/;
    // eslint-disable-next-line camelcase
    const fileName = `${description_file.name}${extensionRegex.exec(description_file.path)[0]}`;
    attachments.push({
      filename: fileName,
      content: fs.createReadStream(path
        .join(DOCUMENTS, document.data.operation.description_file.path)),
    });
  }
  if (document.data.operation.photo_file) {
    for (const photo of document.data.operation.photo_file) {
      const extensionRegex = /(?:\.([^.]+))?$/;
      const fileName = `${photo.name}${extensionRegex.exec(photo.path)[0]}`;
      attachments.push({
        filename: fileName,
        content: fs.createReadStream(path
          .join(DOCUMENTS, photo.path)),
      });
    }
  }

  if (itsts) {
    for (const itst of itsts) {
      let itstPath = null;
      if (itst.path === null) {
        itstPath = itst.data.operation.itst_file.path;
      } else {
        itstPath = itst.path;
      }
      const extensionRegex = /(?:\.([^.]+))?$/;
      const fileName = `${itst.name}${extensionRegex.exec(itstPath)[0]}`;
      attachments.push({
        filename: fileName,
        content: fs.createReadStream(path
          .join(DOCUMENTS, itstPath)),
      });
    }
  }

  const to = data.to.filter(email => isEmailValid(email));
  const mailOptions = {
    from,
    to,
    subject: data.subject,
    text: data.text,
    attachments,
    html: mailTemplate.bonTravailUpdated({icon: ICON, document, ...data}),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendQuizz = async (quizz, data) => {
  logger.info("Send mails to [%s] for quizz [%s]", data.to, quizz.id);
  const to = data.to.filter(email => isEmailValid(email));
  const link = `${QUIZZ}new`;

  const mailOptions = {
    from,
    to,
    subject: data.subject,
    text: data.text,
    html: mailTemplate.quizz({
      ...data,
      icon: ICON,
      accessLink: link,
    }),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendBonOperationnel = async data => {
  logger.info("Send mails to [%s] for bon operationnel [%s]", data.to);

  const mailOptions = {
    from,
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: mailTemplate.bonTravailUpdated({
      ...data,
      icon: ICON,
    }),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendFicheManoeuvreMail = async (data, chef, doc) => {
  logger.info("Send mail to [%s] for manoeuvre [%s] verifying", chef.email, doc.id);

  /* eslint-disable max-len */
  const subject = "Un nouveau document est prêt à être vérifié";
  const text = `Une nouvelle fiche de manoeuvre a été signer et attend votre validation: ${data.reference}`;
  const link = `${MANOEUVRE}/${doc.id}/edit`;
  /* eslint-enable max-len */

  const mailData = {
    email: chef.email,
    accessLink: link,
    icon: ICON,
    lastName: chef.lastName,
    civility: chef.civility,
    text,
  };
  const mailOptions = {
    from,
    to: mailData.email,
    subject,
    text,
    html: mailTemplate.bonTravailInstallation({icon: ICON, ...mailData}),
  };
  await sendMailP(mailOptions);
};

mailSrv.sendItstMail = async (data, to, doc, operator, societyId) => {
  logger.info("Send mail to [%s] for itst [%s] verifying", to.email, doc.id);

  /* eslint-disable max-len */
  const subject = "Un nouveau document est prêt à être vérifié";
  const text = `Une nouvelle ITST est prètre à être signer et attend votre validation: ${data.reference}`;
  const accessLink = operator === "employer" ? `${ITST}/${doc.id}/edit` : mailSrv.getAccessLink({
    token: tokenSrv.operator({id: societyId}, to),
    document: doc.id,
    to: "edit",
  });
  const mailData = {
    email: to.email,
    accessLink,
    icon: ICON,
    lastName: to.lastName,
    civility: to.civility,
    text,
  };
  const mailOptions = {
    from,
    to: mailData.email,
    subject,
    text,
    html: mailTemplate.bonTravailInstallation({icon: ICON, ...mailData}),
  };
  await sendMailP(mailOptions);
};

module.exports = mailSrv;
