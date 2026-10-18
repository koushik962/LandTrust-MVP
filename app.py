from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'landtrust_super_secret_admin_key'

ADMIN_USER = "admin"
ADMIN_PASS = "landtrust2026"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    message = ""
    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'login':
            username = request.form.get('username')
            password = request.form.get('password')
            if username == ADMIN_USER and password == ADMIN_PASS:
                session['admin_logged_in'] = True
                return redirect(url_for('admin'))
            else:
                message = "❌ ভুল ইউজারনেম বা পাসওয়ার্ড!"

    logged_in = session.get('admin_logged_in', False)
    return render_template('admin.html', logged_in=logged_in, message=message)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin'))

if __name__ == '__main__':
    app.run(debug=True)