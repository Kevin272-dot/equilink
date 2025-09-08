from flask import Blueprint, request, jsonify
from extensions import db
from models import Report

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('', methods=['POST'])
def create_report():
    data = request.get_json() or {}
    # Validate required fields
    required_fields = ['type', 'description', 'language']
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {', '.join(missing)}'}), 400

    report = Report(
        type=data['type'],
        description=data['description'],
        language=data['language']
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({'reportId': report.id}), 201


@reports_bp.route('/<string:report_id>', methods=['GET'])
def get_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Report not found'}), 404
    return jsonify({'reportId': report.id, 'status': report.status}), 200
