# Chocobliss by Tasnim — UI/UX Design System Specification

This document details the visual identity, design tokens, color palette, typography, and interactive standards for the Chocobliss artisanal e-commerce experience.

---

## 1. Brand Identity & Aesthetic

Chocobliss by Tasnim embodies an artisanal, luxurious, warm, and sophisticated confectionery aesthetic. It evokes handcrafted indulgence, premium organic ingredients, and timeless elegance.

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Code | HSL / CSS Equivalent | Purpose |
| :--- | :--- | :--- | :--- |
| **Deep Cacao** | `#1C140D` | `hsl(28, 37%, 8%)` | Primary background for dark surfaces, deep text, headers |
| **Cream** | `#F5EDE4` | `hsl(31, 47%, 93%)` | Primary light background, card fills, contrast surfaces |
| **Warm White** | `#FAF7F2` | `hsl(38, 43%, 97%)` | Base page canvas background |
| **Terracotta** | `#C45A3C` | `hsl(13, 54%, 50%)` | Brand accent, primary buttons, badges, urgency highlights |
| **Warm Gold** | `#D4A853` | `hsl(40, 60%, 58%)` | Secondary accent, star ratings, Cocoa Points, premium ribbons |
| **Muted Cacao**| `#634E3F` | `hsl(25, 22%, 32%)` | Subtitles, helper text, inactive navigation icons |
| **Border Cream**| `#E8DCCF` | `hsl(32, 33%, 86%)` | Subtle borders, table dividers, card outlines |

---

## 3. Typography

* **Serif Display (Editorial & Headings):** Playfair Display / Cormorant Garamond / Serif. Conveys timeless luxury and artisanal craft for `h1`, `h2`, `h3`, and product titles.
* **Sans-Serif Body (Interface & Data):** Inter / Outfit / Sans-Serif. Delivers high legibility for product descriptions, ingredient lists, navigation, data tables, and forms.

---

## 4. Layout & Breakpoints

* **Mobile Small:** `< 375px`
* **Mobile Standard:** `375px – 640px`
* **Tablet:** `641px – 1024px`
* **Desktop:** `1025px – 1440px`
* **Large Display:** `> 1440px` (Max container width clamped to `1280px` for readability)

---

## 5. UI Components & Screen Specifications

Based on the designs in `User Design/` and `Admin pannel design/`:

### 1. Storefront Home (`/`)
* **Hero Section:** Smooth HTML5 canvas driven by viewport scroll (`requestAnimationFrame`), seamlessly animating chocolate crafting frames with overlay text.
* **Curated Collections:** Artisanal Single-Origin Bars, Handcrafted Truffles, Luxury Gift Boxes.
* **Brand Story Preview:** Editorial split section highlighting ethical sourcing and Tasnim's craftsmanship.

### 2. Shop & Product Catalog (`/shop`, `/shop/[slug]`)
* Sticky category filter bar (All, Dark, Milk, Vegan, Gift Boxes, Limited Editions).
* Product Card displaying: photography, cacao percentage badge, flavor tags, price, and "Add to Bag" action.
* Detailed Product Page: Origin details, tasting notes, allergen warnings, customer reviews, and quantity selector.

### 3. User Dashboard (`/dashboard`)
* Overview of active orders, tracking status, saved shipping destinations, and **Cocoa Points** loyalty balance.

### 4. Admin Management (`/admin`)
* Dense, clean layout with dark sidebar and contrast data tables.
* Product inventory management with SKU, stock levels, and quick editor modal.
* Order fulfillment pipeline with status updates and customer notes.
