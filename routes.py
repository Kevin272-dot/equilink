from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from extensions import db
from models import Report
from sqlalchemy import desc

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
        location=data.get('location', ''),
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


@reports_bp.route('/admin/reports', methods=['GET'])
def get_all_reports():
    filter_language = request.args.get('language', '')

    query = Report.query
    if filter_language:
        query = query.filter_by(language=filter_language)

    reports = query.order_by(desc(Report.timestamp)).all()
    return render_template('reports_list.html',
                           reports=reports,
                           filter_language=filter_language)


@reports_bp.route('/admin/reports/<string:report_id>/finalize', methods=['GET'])
def finalize_view(report_id):
    report = Report.query.get_or_404(report_id)
    return render_template('report_finalize.html', report=report)


@reports_bp.route('/admin/reports/<string:report_id>/finalize', methods=['POST'])
def finalize_report(report_id):
    report = Report.query.get_or_404(report_id)

    action = request.form.get('action')
    notes = request.form.get('notes', '')

    if action == 'approve':
        report.status = 'approved'
    elif action == 'reject':
        report.status = 'rejected'
    else:
        return "Invalid action", 400

    report.finalized = True
    report.notes = notes

    db.session.commit()
    return redirect(url_for('reports.get_all_reports'))


@reports_bp.route('/admin/reports/<string:report_id>/view', methods=['GET'])
def view_report(report_id):
    report = Report.query.get_or_404(report_id)
    return render_template('report_view.html', report=report)
