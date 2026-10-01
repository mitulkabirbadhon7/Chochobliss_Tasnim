# Chocobliss by Tasnim — Database Schema Specification

This document defines the complete relational database schema for Chocobliss by Tasnim on **Neon Serverless PostgreSQL**, managed via **Prisma ORM**.

---

## 1. Design Principles

1. **Precision & Integrity:** Currency fields (`price`, `subtotal`, `totalAmount`) use `Decimal(10, 2)` to eliminate floating-point calculation errors.
2. **Soft Deletion:** Products support soft deletion via `deletedAt DateTime?` to preserve relational integrity across existing order histories.
3. **Indexing Strategy:** Foreign keys, unique slugs, lookup codes, and frequently queried status filters are indexed for fast retrieval.
4. **Order Immutability:** `OrderItem` snapshots the product name and price at the exact moment of checkout.
5. **Brand Alignment:** Supports loyalty rewards (`cocoaPoints`), artisanal flavor profiles (`cacaoPercentage`, `origin`, `flavorNotes`), gift options (`giftNote`), and CMS banner scheduling.

---

## 2. Entity Relationship Diagram (Conceptual)

```
User ──< Address
User ──< Order ──< OrderItem >── Product
User ──< Wishlist >── Product
User ──< Review >── Product
Announcement (Standalone CMS)
SiteContent (Standalone CMS)
```

---

## 3. Enumerations

### `Role`
Defines role-based access control (RBAC).
* `ADMIN`: Full access to the Admin Panel (`/admin`), product inventory, orders, customer directory, and CMS.
* `CUSTOMER`: Standard authenticated user who can manage account, place orders, view order history, maintain wishlist, and earn Cocoa Points.
* `GUEST`: Unauthenticated visitor browsing products and announcements.

### `OrderStatus`
Lifecycle tracking for customer orders.
* `PENDING`: Order created, awaiting payment verification.
* `PROCESSING`: Payment confirmed, chocolates being packaged.
* `SHIPPED`: Package in transit with carrier.
* `DELIVERED`: Delivered to recipient.
* `CANCELLED`: Order cancelled before fulfillment.

### `PaymentStatus`
* `PENDING`: Awaiting transaction completion.
* `PAID`: Funds captured successfully.
* `FAILED`: Payment rejected or timed out.
* `REFUNDED`: Funds returned to customer.

### `BannerType`
* `PROMO`: Discount or limited-edition batch banner.
* `ANNOUNCEMENT`: General storefront news or holiday hours.
* `ALERT`: Urgent notification (e.g., warm weather shipping advisories).

---

## 4. Models & Tables

### `User`
Stores authenticated user profile and loyalty points.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `email` | `String` | `@unique` | Login email address |
| `name` | `String?` | | Full name |
| `phone` | `String?` | | Contact telephone |
| `avatarUrl` | `String?` | | Profile avatar image URL |
| `role` | `Role` | `@default(CUSTOMER)` | User permission role |
| `cocoaPoints` | `Int` | `@default(0)` | Loyalty points balance |
| `authProvider` | `String` | `@default("credentials")` | Identity provider source |
| `authProviderId` | `String?` | `@unique` | External auth ID (Supabase / Firebase UID) |
| `createdAt` | `DateTime` | `@default(now())` | Account creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last modification timestamp |

**Relations & Indexes:**
* `addresses Address[]`
* `orders Order[]`
* `wishlist WishlistItem[]`
* `reviews Review[]`
* `@@index([email])`
* `@@index([role])`

---

### `Address`
Saved customer shipping and delivery destinations.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `userId` | `String` | | Foreign key to `User` |
| `label` | `String` | `@default("Home")` | e.g., "Home", "Work" |
| `fullName` | `String` | | Recipient full name |
| `street` | `String` | | Street address and apartment/suite |
| `city` | `String` | | City |
| `state` | `String` | | Province / State |
| `postalCode` | `String` | | ZIP / Postal code |
| `country` | `String` | `@default("Bangladesh")` | Country code / name |
| `phone` | `String` | | Contact phone number for delivery |
| `isDefault` | `Boolean` | `@default(false)` | Primary shipping destination |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

**Relations & Indexes:**
* `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
* `@@index([userId])`

---

### `Product`
Artisanal chocolate catalog with inventory and origin metadata.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `name` | `String` | | Product title (e.g., "72% Single-Origin Madagascar") |
| `slug` | `String` | `@unique` | URL slug (e.g., "madagascar-dark-72") |
| `description` | `String` | `@db.Text` | Detailed tasting and product description |
| `price` | `Decimal` | `@db.Decimal(10, 2)` | Standard retail price |
| `salePrice` | `Decimal?` | `@db.Decimal(10, 2)` | Optional promotional discounted price |
| `sku` | `String` | `@unique` | Stock keeping unit (e.g., "CB-BAR-MAD72") |
| `inventory` | `Int` | `@default(0)` | Units currently in stock |
| `cacaoPercentage` | `Int?` | | Percentage of cacao (e.g., 72, 85) |
| `origin` | `String?` | | Cacao bean source (e.g., "Sambirano Valley, Madagascar") |
| `flavorNotes` | `String[]` | | Array of tasting notes (e.g., ["Floral", "Red Fruit", "Citrus"]) |
| `ingredients` | `String?` | `@db.Text` | Complete ingredient list |
| `allergens` | `String[]` | | Allergen declarations (e.g., ["Dairy", "Soy", "Nuts"]) |
| `weight` | `String?` | | Weight specification (e.g., "85g / 3.0 oz") |
| `images` | `String[]` | | Ordered list of product photography URLs |
| `category` | `String` | `@default("Bars")` | Category (e.g., "Bars", "Gift Boxes", "Truffles") |
| `isFeatured` | `Boolean` | `@default(false)` | Flagged for homepage highlight |
| `isPublished` | `Boolean` | `@default(true)` | Visible on the public storefront |
| `deletedAt` | `DateTime?` | | Soft delete timestamp (preserves order integrity) |
| `createdAt` | `DateTime` | `@default(now())` | Product creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Product update timestamp |

**Relations & Indexes:**
* `orderItems OrderItem[]`
* `wishlistItems WishlistItem[]`
* `reviews Review[]`
* `@@index([slug])`
* `@@index([category])`
* `@@index([isPublished, isFeatured])`
* `@@index([deletedAt])`

---

### `Order`
Customer order transactions with pricing breakdown and gift notes.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `orderNumber` | `String` | `@unique` | Human-readable order identifier (e.g., "CB-2026-0042") |
| `userId` | `String` | | Foreign key to `User` |
| `status` | `OrderStatus` | `@default(PENDING)` | Current fulfillment status |
| `paymentStatus` | `PaymentStatus` | `@default(PENDING)` | Payment capture status |
| `paymentMethod` | `String` | `@default("CARD")` | Payment provider / method (e.g., "CARD", "COD", "BKASH") |
| `subtotal` | `Decimal` | `@db.Decimal(10, 2)` | Sum of item subtotals |
| `shippingFee` | `Decimal` | `@db.Decimal(10, 2)` | Delivery cost |
| `discountAmount` | `Decimal` | `@db.Decimal(10, 2) @default(0)` | Promotional or voucher discount |
| `totalAmount` | `Decimal` | `@db.Decimal(10, 2)` | Net charged total |
| `cocoaPointsEarned` | `Int` | `@default(0)` | Loyalty points credited for this purchase |
| `cocoaPointsRedeemed` | `Int` | `@default(0)` | Loyalty points spent on this order |
| `shippingAddress` | `Json` | | Frozen JSON snapshot of shipping destination at checkout |
| `giftNote` | `String?` | `@db.Text` | Personalized message included in gift packaging |
| `trackingNumber` | `String?` | | Courier tracking identifier |
| `notes` | `String?` | `@db.Text` | Internal admin/fulfillment notes |
| `createdAt` | `DateTime` | `@default(now())` | Order placement timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Order modification timestamp |

**Relations & Indexes:**
* `user User @relation(fields: [userId], references: [id], onDelete: Restrict)`
* `items OrderItem[]`
* `@@index([userId])`
* `@@index([orderNumber])`
* `@@index([status])`
* `@@index([createdAt])`

---

### `OrderItem`
Immutable line-item snapshots within an order.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `orderId` | `String` | | Foreign key to `Order` |
| `productId` | `String?` | | Foreign key to `Product` (set null if hard deleted) |
| `productName` | `String` | | Historical product name at purchase |
| `productImage` | `String?` | | Historical product thumbnail |
| `unitPrice` | `Decimal` | `@db.Decimal(10, 2)` | Price per unit at moment of order |
| `quantity` | `Int` | | Quantity purchased |
| `subtotal` | `Decimal` | `@db.Decimal(10, 2)` | `unitPrice * quantity` |

**Relations & Indexes:**
* `order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)`
* `product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)`
* `@@index([orderId])`
* `@@index([productId])`

---

### `WishlistItem`
Customer saved items for future purchase.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `userId` | `String` | | Foreign key to `User` |
| `productId` | `String` | | Foreign key to `Product` |
| `createdAt` | `DateTime` | `@default(now())` | Timestamp saved |

**Relations & Indexes:**
* `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
* `product Product @relation(fields: [productId], references: [id], onDelete: Cascade)`
* `@@unique([userId, productId])`
* `@@index([userId])`

---

### `Review`
Customer ratings and product reviews.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `userId` | `String` | | Foreign key to `User` |
| `productId` | `String` | | Foreign key to `Product` |
| `rating` | `Int` | | Rating score (1 to 5) |
| `title` | `String?` | | Review headline |
| `comment` | `String` | `@db.Text` | Detailed customer review |
| `isApproved` | `Boolean` | `@default(true)` | Moderation status |
| `createdAt` | `DateTime` | `@default(now())` | Submission timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Edit timestamp |

**Relations & Indexes:**
* `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
* `product Product @relation(fields: [productId], references: [id], onDelete: Cascade)`
* `@@index([productId, isApproved])`
* `@@index([userId])`

---

### `Announcement`
Storefront banners and seasonal offers.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `title` | `String` | | Announcement heading |
| `content` | `String` | `@db.Text` | Body message or coupon description |
| `bannerType` | `BannerType` | `@default(PROMO)` | Visual style classification |
| `linkUrl` | `String?` | | Destination click URL |
| `bannerImage` | `String?` | | Optional banner graphic URL |
| `isActive` | `Boolean` | `@default(true)` | Publication flag |
| `startDate` | `DateTime?` | | Scheduled activation date |
| `endDate` | `DateTime?` | | Scheduled expiration date |
| `createdAt` | `DateTime` | `@default(now())` | Record creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Record update timestamp |

**Relations & Indexes:**
* `@@index([isActive, startDate, endDate])`

---

### `SiteContent`
Key-value content management for editorial sections.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `key` | `String` | `@unique` | Identifier (e.g., "story_history", "hero_headline") |
| `title` | `String` | | Section title |
| `content` | `Json` | | Structured rich-text or section configuration |
| `mediaUrl` | `String?` | | Associated media or background URL |
| `updatedAt` | `DateTime` | `@updatedAt` | Last modification timestamp |

**Relations & Indexes:**
* `@@index([key])`
