# Catalog & Pricing Module Analysis

## Comparison: Current Implementation vs Requirements

### ✅ **1. Category Management**

#### **Requirements:**
- [x] Add new category
- [x] Edit category name
- [x] Upload icon
- [x] Toggle Active/Inactive
- [x] Sort order
- [x] Category Name
- [x] Category Icon
- [x] Description (optional, short tagline)
- [x] Status (Active / Inactive)
- [x] Display Order

#### **Current Implementation Status:**
❌ **MISSING - No dedicated Category Management UI**

**What exists:**
- Categories are hardcoded in `PricingEditorModal.tsx` (lines 57-64)
- Categories displayed in ServiceTreeView but no management interface
- No add/edit category forms
- No category icon upload functionality
- No category status toggle
- No display order management

**Gap:** Need a dedicated Category Management screen with CRUD operations

---

### ✅ **2. Sub-Service Management**

#### **Requirements:**
- [x] Add sub-service inside a category
- [x] Edit name/description
- [x] Add time slot duration (e.g., 45 mins standard time)
- [x] Set base price (flat price or min-range)
- [x] Enable/disable sub-service
- [x] Assign to multiple categories (future scalable)
- [x] Add recommended consumption/parts notes

#### **Required Fields:**
- [x] Sub-Service Name
- [x] Select Category
- [x] Description
- [x] Base Price
- [x] Estimated Duration
- [x] Required Skills / Tags (Display only now)
- [x] Status
- [x] Display Order

#### **Current Implementation Status:**
🟡 **PARTIALLY IMPLEMENTED**

**What exists:**
- ✅ `AddServiceForm.tsx` - Has basic fields (name, category, description, price, duration, status)
- ✅ `EditServiceForm.tsx` - Can edit services
- ✅ Service listing in `ServiceTable.tsx`
- ✅ Status toggle functionality exists

**What's missing:**
- ❌ Time slot duration as dropdown (30/60/90 mins) - Currently free text
- ❌ Display order field
- ❌ Required Skills/Tags field (even display-only)
- ❌ Recommended consumption/parts notes field
- ❌ Assign to multiple categories functionality
- ❌ Base price vs min-range pricing logic unclear

---

### ✅ **3. Add-Ons / Extras**

#### **Requirements:**
- [x] Add edit add-ons
- [x] Apply add-on to selected sub-services (multi-select)
- [x] Flat price / per quantity option
- [x] Add-on Name
- [x] Applies to (Service selection multi)
- [x] Price (Flat)
- [x] Per unit option (Checkbox)
- [x] Status

#### **Current Implementation Status:**
❌ **NOT IMPLEMENTED**

**What exists:**
- Add-ons mentioned in `ServiceTreeView.tsx` (line 211-212) as mock data
- Add-ons tab exists in `PricingEditorModal.tsx` but only shows placeholder (line 346-350)

**What's missing:**
- ❌ No add-on management UI
- ❌ No add-on creation form
- ❌ No multi-select service assignment
- ❌ No per-unit pricing toggle
- ❌ No add-on status management

---

### ✅ **4. Pricing Control**

#### **Requirements:**
- [x] Set price per service
- [x] Edit pricing
- [x] Track default + add-ons pricing
- [x] Promo support (coupons in different module)

#### **Current Implementation Status:**
🟡 **PARTIALLY IMPLEMENTED**

**What exists:**
- ✅ `PricingEditorModal.tsx` - Has pricing editor with categories and services tabs
- ✅ Can edit base price, min price, max price
- ✅ Duration field
- ✅ Status toggle
- ✅ Shows add-ons (but can't manage them)

**What's missing:**
- ❌ No pricing history log (optional future - acceptable)
- ❌ Inline edit functionality limited

---

### ✅ **5. Provider Service Assignment**

#### **Requirements:**
- [x] Assign allowed categories to provider
- [x] View provider skills list
- [x] Modify provider skill assignment

#### **Current Implementation Status:**
🟡 **PARTIALLY IMPLEMENTED**

**What exists:**
- ✅ In `EditProviderForm.tsx` and `AddProviderForm.tsx` - single category selection (line 172-184)
- ✅ Provider can have one service category

**What's missing:**
- ❌ No multi-category assignment
- ❌ No dedicated Provider Service Assignment UI
- ❌ No view of all provider skills in one place
- ❌ No bulk category assignment
- ❌ Cannot assign specific sub-services to providers

---

## UI Checklist Status

### Category Screen
- ❌ Show category list (partially - only in tree view, not as table)
- ❌ Add category button
- ❌ Search & filter
- ❌ Category status toggle
- ❌ Drag sorting (optional)
- ❌ Icon upload
- ❌ Confirm delete popup
- ❌ Pagination
- ❌ Validation (Name required, No duplicate, Square icons only)

### Sub-Service Screen
- ✅ List with category grouping (ServiceTreeView)
- ✅ Add sub-service modal/page (AddServiceForm)
- ✅ Search by name/category (in ServiceTable)
- ✅ Edit/delete (EditServiceForm, delete handlers exist)
- ✅ Status toggle
- ❌ Sorting (no display order)
- ✅ Price visible in table
- ✅ Estimated duration visible

### Sub-Service Fields UI
- ✅ Category drop-down (required) - in AddServiceForm
- ✅ Service name
- ✅ Description
- ✅ Price field
- ❌ Time estimate (dropdown 30/60/90 mins) - currently free text
- ✅ Mandatory to pick category

### Add-Ons Screen
- ❌ Add add-on
- ❌ Connect add-on to one or multiple services
- ❌ Flat price + per unit toggle
- ❌ Status toggle

### Pricing UI
- ✅ Show price list table (in PricingEditorModal)
- ✅ Edit inline / modal
- ✅ View add-on pricing (display only)
- ❌ Validation for numeric input (partially - no proper validation)
- ❌ History log (optional future)

### Provider Assignment UI
- ❌ Search provider
- ❌ Select allowed categories (currently only single category)
- ❌ Save (no dedicated screen)
- ❌ Show what skills provider has

### System Messages
- ❌ Success toasts
- ❌ Error toasts
- ❌ Delete confirmations
- ❌ Form validations (partial - basic HTML validation only)
- ❌ "Changes saved" message

---

## Summary

### ✅ **What's Implemented:**
1. Basic service CRUD (Add/Edit forms exist)
2. Service listing with category grouping
3. Basic pricing editor modal
4. Service status management
5. Provider category assignment (single category only)

### ❌ **Critical Missing Features:**
1. **Category Management UI** - No CRUD for categories
2. **Add-Ons Management** - Completely missing
3. **Provider Multi-Category Assignment** - Only single category supported
4. **Form Validation & Toast Messages** - No proper validation/toast system
5. **Time Duration Dropdown** - Currently free text instead of dropdown
6. **Display Order** - Missing for both categories and services
7. **Skills/Tags Field** - Missing from service forms

### 🟡 **Partially Implemented:**
1. Pricing management (basic structure exists but needs refinement)
2. Provider service assignment (exists but limited to single category)
3. Service management (core functionality exists but missing some fields)

---

## Recommendations

1. **Create Category Management Module** - New page/section for full CRUD
2. **Build Add-Ons Management** - New screen with multi-service assignment
3. **Enhance Provider Assignment** - Support multiple categories/sub-services
4. **Add Toast Notification System** - For success/error messages
5. **Implement Form Validation** - Proper validation with error messages
6. **Add Display Order Fields** - For both categories and services
7. **Enhance Duration Input** - Change to dropdown (30/60/90 mins)
8. **Add Skills/Tags Field** - Even if display-only for now

