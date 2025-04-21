Database Schema
## business_closure_log
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| closure_id | integer | NO | nextval('business_closure_log_closure_id_seq'::regclass) | business_closure_log_pkey |
| closure_date | timestamp without time zone | NO | | |

## company_transaction
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| transaction_id | integer | NO | | company_transaction_pkey |
| tracking_number | integer | NO | | |
| vendor_id | integer | NO | | company_transaction_vendor_id_fkey |
| estimated_delivery | date | YES | | |

## customer_reward
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| customer_id | integer | NO | | customer_reward_pkey |
| points | integer | NO | | |
| email | character varying | NO | | |
| phone_number | bigint | NO | | |

## customer_transaction
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| customer_transaction_num | integer | NO | | customer_transaction_pkey |
| order_id | integer | NO | | |
| product_id | integer | NO | | customer_transaction_product_id_fkey |
| customer_id | integer | YES | | customer_transaction_customer_id_fkey |
| purchase_date | timestamp without time zone | NO | | |
| ice_amount | double precision | YES | | |
| topping_type | character varying | YES | | |

## employee
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| employee_id | integer | NO | | employee_pkey |
| emp_email | character varying | NO | | |
| emp_phone | bigint | NO | | |
| is_manager | boolean | NO | | |
| social_security | integer | NO | | |
| emp_pay | double precision | NO | | |
| emp_bank_account | integer | NO | | |

## inventory
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| item_id | integer | NO | | inventory_pkey |
| item_name | character varying | NO | | |
| amount | integer | NO | | |
| transaction_id | integer | NO | | inventory_transaction_id_fkey |

## menu_item_inventory
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| product_id | integer | NO | | menu_item_inventory_pkey, menu_item_inventory_product_id_fkey |
| item_id | integer | NO | | menu_item_inventory_pkey, menu_item_inventory_item_id_fkey |
| quantity_used | integer | NO | | |

## product
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| product_id | integer | NO | | product_pkey |
| product_name | character varying | NO | | |
| product_cost | double precision | NO | | |
| product_type | character varying | NO | | |
| allergens    | character varying | YES | 'None' | |

## trends
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| product_id | integer | NO | | trends_pkey, fk_trends |
| daily_purchased | integer | NO | | |
| weekly_purchased | integer | NO | | |

## vendor
| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| vendor_id | integer | NO | | vendor_pkey |
| vendor_name | character varying | NO | | |
| vendor_phone_number | integer | YES | | |
| vendor_email | character varying | YES | | |
| vendor_location | character varying | YES | | |
