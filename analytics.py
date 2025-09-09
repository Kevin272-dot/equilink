import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import base64
from models import Report
from sqlalchemy import func
from extensions import db
from datetime import datetime, timedelta
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

# Set up seaborn if available, fallback gracefully if not
try:
    import seaborn as sns
    sns.set_palette("husl")
    SEABORN_AVAILABLE = True
except ImportError:
    SEABORN_AVAILABLE = False


class ReportAnalytics:
    """Analytics class for generating statistics and visualizations from incident reports"""

    def __init__(self):
        # Set style for better looking charts
        if SEABORN_AVAILABLE:
            plt.style.use('seaborn-v0_8')
        else:
            plt.style.use('default')

    def get_reports_dataframe(self):
        """Convert reports from database to pandas DataFrame"""
        reports = Report.query.all()
        data = []
        for report in reports:
            data.append({
                'id': report.id,
                'type': report.type,
                'description': report.description,
                'location': report.location,
                'language': report.language,
                'status': report.status,
                'timestamp': report.timestamp,
                'finalized': report.finalized
            })
        return pd.DataFrame(data)

    def get_category_statistics(self):
        """Get statistical summary of reports by category"""
        df = self.get_reports_dataframe()
        if df.empty:
            return {
                'total_reports': 0,
                'category_counts': {},
                'category_percentages': {}
            }

        # Count reports by type
        category_counts = df['type'].value_counts().to_dict()
        total_reports = len(df)
        category_percentages = {
            k: round((v/total_reports)*100, 2) for k, v in category_counts.items()}

        return {
            'total_reports': total_reports,
            'category_counts': category_counts,
            'category_percentages': category_percentages,
            'most_common_category': df['type'].mode().iloc[0] if not df.empty else None,
            'unique_categories': df['type'].nunique()
        }

    def generate_category_chart(self):
        """Generate pie chart showing distribution of report categories"""
        df = self.get_reports_dataframe()
        if df.empty:
            return None

        plt.figure(figsize=(10, 8))
        category_counts = df['type'].value_counts()

        # Create pie chart
        plt.pie(category_counts.values, labels=category_counts.index,
                autopct='%1.1f%%', startangle=90)
        plt.title('Distribution of Incident Reports by Category',
                  fontsize=16, fontweight='bold')

        # Convert to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=300)
        buffer.seek(0)
        chart_data = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        return chart_data

    def generate_trends_chart(self, days=30):
        """Generate line chart showing report trends over time"""
        df = self.get_reports_dataframe()
        if df.empty:
            return None

        # Filter to last N days
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        df = df[df['timestamp'] >= cutoff_date]

        if df.empty:
            return None

        # Group by date
        df['date'] = df['timestamp'].dt.date
        daily_counts = df.groupby('date').size()

        plt.figure(figsize=(12, 6))
        plt.plot(daily_counts.index, daily_counts.values,
                 marker='o', linewidth=2, markersize=6)
        plt.title(
            f'Daily Report Trends (Last {days} days)', fontsize=16, fontweight='bold')
        plt.xlabel('Date')
        plt.ylabel('Number of Reports')
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)

        # Convert to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=300)
        buffer.seek(0)
        chart_data = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        return chart_data

    def generate_category_trends_chart(self, days=30):
        """Generate stacked bar chart showing category trends over time"""
        df = self.get_reports_dataframe()
        if df.empty:
            return None

        # Filter to last N days
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        df = df[df['timestamp'] >= cutoff_date]

        if df.empty:
            return None

        # Group by date and category
        df['date'] = df['timestamp'].dt.date
        pivot_df = df.groupby(['date', 'type']).size().unstack(fill_value=0)

        plt.figure(figsize=(14, 8))
        pivot_df.plot(kind='bar', stacked=True, ax=plt.gca())
        plt.title(
            f'Report Categories by Day (Last {days} days)', fontsize=16, fontweight='bold')
        plt.xlabel('Date')
        plt.ylabel('Number of Reports')
        plt.xticks(rotation=45)
        plt.legend(title='Category', bbox_to_anchor=(
            1.05, 1), loc='upper left')

        # Convert to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=300)
        buffer.seek(0)
        chart_data = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        return chart_data

    def get_language_statistics(self):
        """Get statistics about reports by language"""
        df = self.get_reports_dataframe()
        if df.empty:
            return {}

        language_counts = df['language'].value_counts().to_dict()
        total = len(df)
        language_percentages = {k: round((v/total)*100, 2)
                                for k, v in language_counts.items()}

        return {
            'language_counts': language_counts,
            'language_percentages': language_percentages,
            'most_common_language': df['language'].mode().iloc[0] if not df.empty else None
        }

    def get_status_statistics(self):
        """Get statistics about report status"""
        df = self.get_reports_dataframe()
        if df.empty:
            return {}

        status_counts = df['status'].value_counts().to_dict()
        total = len(df)
        status_percentages = {k: round((v/total)*100, 2)
                              for k, v in status_counts.items()}

        return {
            'status_counts': status_counts,
            'status_percentages': status_percentages,
            'finalized_count': df['finalized'].sum(),
            'pending_count': len(df[df['status'] == 'pending'])
        }

    def generate_comprehensive_report(self):
        """Generate a comprehensive analytics report"""
        return {
            'category_stats': self.get_category_statistics(),
            'language_stats': self.get_language_statistics(),
            'status_stats': self.get_status_statistics(),
            'category_chart': self.generate_category_chart(),
            'trends_chart': self.generate_trends_chart(),
            'category_trends_chart': self.generate_category_trends_chart()
        }
