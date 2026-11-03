# Mail — CS50W Project 3

A single-page email client built with **Django** and **JavaScript**. Users can register, send emails to other users, read their inbox, archive messages and reply, all without a page reload.

This is Project 3 of [CS50's Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/). The Django back end and its JSON API were provided by the course; the entire front end (the single-page app logic in `inbox.js`, plus the layout and styling) is my work.

> Emails are stored in the app's own database and are never sent to real mail servers, so any address such as `foo@example.com` can be used to try it out.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)


## Video demo

[Watch the project demo on YouTube](https://youtu.be/PyUP44Vg898)


## Features

- **Compose and send** emails to one or more comma-separated recipients, with clear error messages for missing or unknown recipients
- **Inbox, Sent and Archived** mailboxes, each loaded dynamically from the API
- **Read / unread styling:** unread emails have a white background, read emails are grey
- **Email view** showing sender, recipients, subject, timestamp and body, and marking the email as read automatically
- **Archive and unarchive** received emails (not offered for sent mail)
- **Reply** with the recipient, `Re:` subject and quoted original message prefilled
- **Safe rendering:** user-supplied content is inserted as text or escaped, so pasted HTML or scripts are never executed
- **Race-condition protection:** a slow response from a previous mailbox can never overwrite the view the user is currently on

## Tech stack

| Layer | Technology |
| --- | --- |
| Back end | Python, Django |
| Front end | HTML, CSS, JavaScript (no frameworks) |
| Styling | Bootstrap 4 plus custom CSS |
| Database | SQLite by default; PostgreSQL via `DATABASE_URL` |
| Deployment | Gunicorn, WhiteNoise |

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/dianr6boy1386/Mail.git
cd <repository>

# 2. (Recommended) create a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create the database tables
python manage.py makemigrations mail
python manage.py migrate

# 5. Run the development server
python manage.py runserver
```

Open <http://127.0.0.1:8000>, click **Register**, create two accounts (for example `foo@example.com` and `bar@example.com`) and send mail between them.

### Configuration

Optional settings are read from environment variables or a `.env` file (see `.env.example`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Secret key (required when `DJANGO_DEBUG` is off) | insecure dev key |
| `DJANGO_DEBUG` | Enable debug mode | `True` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1,[::1]` |
| `DATABASE_URL` | Database connection string | local SQLite file |

## API reference

The front end talks to these JSON routes, all of which require a logged-in user.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/emails/<mailbox>` | List emails in `inbox`, `sent` or `archive`, newest first |
| `GET` | `/emails/<id>` | Get a single email |
| `POST` | `/emails` | Send an email (`recipients`, `subject`, `body`) |
| `PUT` | `/emails/<id>` | Update an email's `read` and/or `archived` flag |

## Project structure

```
.
├── manage.py
├── project3/                 # Django project settings and URLs
└── mail/
    ├── models.py             # User and Email models
    ├── views.py              # Page views and JSON API
    ├── urls.py
    ├── static/mail/
    │   ├── inbox.js          # Single-page app logic
    │   └── styles.css
    └── templates/mail/       # layout, inbox, login, register
```

## How it works

The server renders one page (`inbox.html`). `inbox.js` then switches between the mailbox, email and compose views by showing and hiding elements, and uses `fetch` to call the API above. Each view change is tracked so that late responses from earlier requests are ignored.

## Security note

The CS50 starter code exempts the API routes from Django's CSRF protection to keep the exercise simple. A production application should keep CSRF protection enabled and send the token with every `POST` and `PUT` request.

## Acknowledgements

Project specification and back end provided by [CS50W](https://cs50.harvard.edu/web/) (Harvard University).

## License

Released under the [MIT License](LICENSE).
