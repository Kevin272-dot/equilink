from flask import Flask, request
from config import Config
from extensions import db, migrate, cors
from routes import reports_bp
import datetime


# We'll handle language selection in the frontend


def create_app():
    # Serve the React build static files
    app = Flask(
        __name__,
        static_folder="client/build",
        static_url_path="",
        template_folder="Templates"
    )
    app.config.from_object(Config)
    app.config['JSON_AS_ASCII'] = False
    app.config['SECRET_KEY'] = 'equilink-secret-key'

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    app.register_blueprint(reports_bp, url_prefix='/reports')
    # Catch-all route to serve React app

    # Add a health check endpoint for the React app to check connectivity
    @app.route('/api/health')
    def health_check():
        # Always return 200 status to ensure the app always thinks it's online
        # This is critical for the UX since offline detection causes more problems than it solves
        return {"status": "online", "timestamp": str(datetime.datetime.now())}, 200

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        return app.send_static_file('index.html')
    return app


app = create_app()

if __name__ == '__main__':
    # Run on default port 5000; access at http://localhost:5000
    app.run(debug=True)
