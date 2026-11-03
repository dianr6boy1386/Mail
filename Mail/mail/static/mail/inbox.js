// Incremented every time the visible view changes, so a slow response from an
// earlier request can never draw into a view the user has already left.
let current_view = 0;

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(prefill = {}) {
  current_view++;

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = prefill.recipients || '';
  document.querySelector('#compose-subject').value = prefill.subject || '';
  document.querySelector('#compose-body').value = prefill.body || '';
  const messageElement = document.querySelector('#compose-message');
  if (messageElement) {
    messageElement.remove();
  }
  document.querySelector('#compose-recipients').focus();
}

function load_mailbox(mailbox) {
  const view_id = ++current_view;

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const mailboxName = mailbox === 'archive' ? 'Archived' : mailbox.charAt(0).toUpperCase() + mailbox.slice(1);
  const emailsView = document.querySelector('#emails-view');
  emailsView.innerHTML = `<h3>${mailboxName}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    if (view_id !== current_view) {
      return;
    }

    if (emails.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-mailbox';
      emptyMessage.textContent = `No emails in ${mailboxName.toLowerCase()}.`;
      emailsView.append(emptyMessage);
      return;
    }

    emails.forEach(email => emailsView.append(create_email_row(email, mailbox)));
  });
}

function send_email(event) {
  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json().then(data => ({ ok: response.ok, data })))
  .then(result => {
    if (result.ok) {
      load_mailbox('sent');
    } else {
      show_compose_message(result.data.error || 'Unable to send email.');
    }
  });
}

function create_email_row(email, mailbox) {
  const row = document.createElement('div');
  row.className = `email-row ${email.read ? 'read' : 'unread'}`;
  row.addEventListener('click', () => view_email(email.id, mailbox));

  const sender = document.createElement('span');
  sender.className = 'email-row-sender';
  sender.textContent = mailbox === 'sent' ? `To: ${email.recipients.join(', ')}` : email.sender;

  const subject = document.createElement('span');
  subject.className = 'email-row-subject';
  subject.textContent = email.subject || '(no subject)';

  const timestamp = document.createElement('span');
  timestamp.className = 'email-row-timestamp';
  timestamp.textContent = email.timestamp;

  row.append(sender, subject, timestamp);
  return row;
}

function view_email(emailId, mailbox) {
  const view_id = ++current_view;

  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
    if (view_id !== current_view) {
      return;
    }

    document.querySelector('#compose-view').style.display = 'none';
    const emailsView = document.querySelector('#emails-view');
    emailsView.style.display = 'block';
    emailsView.innerHTML = '';

    if (!email.read) {
      update_email(email.id, { read: true });
    }

    const detail = document.createElement('div');
    detail.className = 'email-detail';

    const header = document.createElement('div');
    header.className = 'email-detail-header';
    header.innerHTML = `
      <h3>${escape_html(email.subject || '(no subject)')}</h3>
      <p><strong>From:</strong> ${escape_html(email.sender)}</p>
      <p><strong>To:</strong> ${escape_html(email.recipients.join(', '))}</p>
      <p><strong>Timestamp:</strong> ${escape_html(email.timestamp)}</p>
    `;

    const actions = document.createElement('div');
    actions.className = 'email-actions';
    actions.append(create_button('Reply', 'btn btn-sm btn-outline-primary', () => reply_to_email(email)));

    if (mailbox !== 'sent') {
      const archiveText = email.archived ? 'Unarchive' : 'Archive';
      actions.append(create_button(archiveText, 'btn btn-sm btn-outline-secondary', () => {
        update_email(email.id, { archived: !email.archived })
        .then(() => load_mailbox('inbox'));
      }));
    }

    const body = document.createElement('pre');
    body.className = 'email-body';
    body.textContent = email.body;

    detail.append(header, actions, body);
    emailsView.append(detail);
  });
}

function reply_to_email(email) {
  const subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
  const body = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;

  compose_email({
    recipients: email.sender,
    subject: subject,
    body: body
  });
}

function update_email(emailId, data) {
  return fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

function create_button(text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

function show_compose_message(message) {
  let messageElement = document.querySelector('#compose-message');
  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.id = 'compose-message';
    messageElement.className = 'alert alert-danger';
    document.querySelector('#compose-form').prepend(messageElement);
  }
  messageElement.textContent = message;
}

function escape_html(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}
