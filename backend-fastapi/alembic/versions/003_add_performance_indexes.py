"""add high performance composite database indexes

Revision ID: 003
Revises: 1f3754022353
Create Date: 2026-11-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '003'
down_revision = '1f3754022353'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Invoices performance indexes
    op.create_index('ix_invoices_profile_status', 'invoices', ['business_profile_id', 'status'], unique=False)
    op.create_index('ix_invoices_profile_created', 'invoices', ['business_profile_id', 'created_at'], unique=False)
    op.create_index('ix_invoices_date', 'invoices', ['date'], unique=False)

    # Customers search & filter indexes
    op.create_index('ix_customers_profile_name', 'customers', ['business_profile_id', 'name'], unique=False)
    op.create_index('ix_customers_phone', 'customers', ['phone'], unique=False)

    # Products search & category filter indexes
    op.create_index('ix_products_profile_category', 'products', ['business_profile_id', 'category'], unique=False)
    op.create_index('ix_products_name', 'products', ['name'], unique=False)

    # Expenses date sort & category indexes
    op.create_index('ix_expenses_profile_date', 'expenses', ['business_profile_id', 'date'], unique=False)
    op.create_index('ix_expenses_category', 'expenses', ['category'], unique=False)

    # Payments reconciliation indexes
    op.create_index('ix_payments_profile_status', 'payments', ['business_profile_id', 'status'], unique=False)
    op.create_index('ix_payments_profile_created', 'payments', ['business_profile_id', 'created_at'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_payments_profile_created', table_name='payments')
    op.drop_index('ix_payments_profile_status', table_name='payments')
    op.drop_index('ix_expenses_category', table_name='expenses')
    op.drop_index('ix_expenses_profile_date', table_name='expenses')
    op.drop_index('ix_products_name', table_name='products')
    op.drop_index('ix_products_profile_category', table_name='products')
    op.drop_index('ix_customers_phone', table_name='customers')
    op.drop_index('ix_customers_profile_name', table_name='customers')
    op.drop_index('ix_invoices_date', table_name='invoices')
    op.drop_index('ix_invoices_profile_created', table_name='invoices')
    op.drop_index('ix_invoices_profile_status', table_name='invoices')
