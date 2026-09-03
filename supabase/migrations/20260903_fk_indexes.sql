-- =============================================================
-- Performance: FK indexes
-- Ref: docs/AUDIT.md — P1-6
-- Date: 2026-09-03
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_products_product_id ON blog_post_products(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_coupon_id ON carts(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id ON coupon_usages(order_id);
CREATE INDEX IF NOT EXISTS idx_coupons_category_id ON coupons(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);
