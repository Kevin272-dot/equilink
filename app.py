from flask import Flask
from config import Config
from extensions import db, migrate, cors
from routes import reports_bp


def create_app():
    # Serve the React build static files
    app = Flask(
        __name__,
        static_folder="client/build",
        static_url_path=""
    )
    app.config.from_object(Config)
    app.config['JSON_AS_ASCII'] = False
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    app.register_blueprint(reports_bp, url_prefix='/reports')
    # Catch-all route to serve React app

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        return app.send_static_file('index.html')
    return app


app = create_app()

if __name__ == '__main__':
    # Run on default port 5000; access at http://localhost:5000
    app.run(debug=True)
