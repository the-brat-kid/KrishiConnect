"""add offline aadhaar kyc fields and dedup index to users

Revision ID: 004
Revises: 003
Create Date: 2026-11-20 22:50:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('users', sa.Column('kyc_status', sa.String(), nullable=False, server_default='PENDING'))
    op.add_column('users', sa.Column('kyc_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('kyc_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('kyc_dob', sa.String(), nullable=True))
    op.add_column('users', sa.Column('kyc_pincode', sa.String(), nullable=True))
    op.add_column('users', sa.Column('kyc_dedup_hash', sa.String(), nullable=True))
    op.create_index('ix_users_kyc_dedup_hash', 'users', ['kyc_dedup_hash'], unique=True)

def downgrade() -> None:
    op.drop_index('ix_users_kyc_dedup_hash', table_name='users')
    op.drop_column('users', 'kyc_dedup_hash')
    op.drop_column('users', 'kyc_pincode')
    op.drop_column('users', 'kyc_dob')
    op.drop_column('users', 'kyc_name')
    op.drop_column('users', 'kyc_verified_at')
    op.drop_column('users', 'kyc_status')
