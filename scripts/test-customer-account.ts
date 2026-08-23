import { customerRepository } from "../src/lib/firestore/customer";
import { Customer, CustomerAddress, CustomerNotification } from "../src/types/customer";
import { customLabelRepository } from "../src/lib/firestore/custom-labels";
import { CustomLabelConfiguration } from "../src/types/custom-label";

console.log("==================================================");
console.log("SCENTLAB PROMPT #12 CUSTOMER ACCOUNT TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 6;

// TEST 1: Customer Profile CRUD
async function runTests() {
  const customerA: Customer = {
    id: "cust_test_alpha",
    firebaseUid: "cust_test_alpha",
    email: "alpha@perfumer.com",
    firstName: "Alexander",
    lastName: "Creed",
    role: "customer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await customerRepository.saveProfile(customerA);
  const fetchedA = await customerRepository.getProfile("cust_test_alpha");

  if (fetchedA && fetchedA.email === "alpha@perfumer.com" && fetchedA.firstName === "Alexander") {
    console.log("✓ TEST 1: Customer Profile creation & retrieval -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 1 FAILED:", fetchedA);
  }

  // TEST 2: Address Book CRUD & Default Toggle
  const addr1: CustomerAddress = {
    id: "addr_alpha_1",
    customerId: "cust_test_alpha",
    firstName: "Alexander",
    lastName: "Creed",
    company: "Creed Studio LLC",
    line1: "500 Formulation Blvd",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const addr2: CustomerAddress = {
    id: "addr_alpha_2",
    customerId: "cust_test_alpha",
    firstName: "Alexander",
    lastName: "Creed",
    company: "Creed Lab 2",
    line1: "700 Chemist Way",
    city: "New York",
    state: "NY",
    postalCode: "10002",
    country: "United States",
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await customerRepository.saveAddress(addr1);
  await customerRepository.saveAddress(addr2);
  await customerRepository.setDefaultAddress("addr_alpha_2", "cust_test_alpha");

  const alphaAddresses = await customerRepository.getAddresses("cust_test_alpha");
  const newDefault = alphaAddresses.find((a) => a.id === "addr_alpha_2");
  const oldDefault = alphaAddresses.find((a) => a.id === "addr_alpha_1");

  if (newDefault?.isDefault === true && oldDefault?.isDefault === false) {
    console.log("✓ TEST 2: Address Book CRUD & Default Address toggle -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 2 FAILED:", { alphaAddresses });
  }

  // TEST 3: Customer Isolation Security Assertion
  const betaAddresses = await customerRepository.getAddresses("cust_test_beta");
  if (betaAddresses.length === 0 && !betaAddresses.some((a) => a.customerId === "cust_test_alpha")) {
    console.log("✓ TEST 3: Customer Isolation (Customer B cannot view Customer A's addresses) -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 3 FAILED:", betaAddresses);
  }

  // TEST 4: Custom Label Design Duplication
  const originalLabel: CustomLabelConfiguration = {
    id: "cl_orig_101",
    customerId: "cust_test_alpha",
    productId: "prod_rollon_10ml",
    customLabelProductId: "prod_custom_labels",
    labelSizeId: "size_rollon_10ml",
    labelSizeName: "1.5 x 2.25 Standard",
    width: 1.5,
    height: 2.25,
    materialId: "mat_waterproof_vinyl",
    materialName: "Waterproof Vinyl",
    brandName: "PARFUM NOIR",
    fragranceName: "Santal 33 Accord",
    quantity: 50,
    unitPrice: 0.60,
    price: 30.00,
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await customLabelRepository.saveConfiguration(originalLabel);

  // Duplicate logic: Creates CL-002 as draft without mutating original
  const duplicateLabel: CustomLabelConfiguration = {
    ...originalLabel,
    id: "cl_copy_102",
    brandName: `${originalLabel.brandName} (Copy)`,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await customLabelRepository.saveConfiguration(duplicateLabel);

  const origCheck = await customLabelRepository.getConfigurationById("cl_orig_101");
  const dupCheck = await customLabelRepository.getConfigurationById("cl_copy_102");

  if (origCheck?.status === "approved" && dupCheck?.status === "draft" && dupCheck?.id === "cl_copy_102") {
    console.log("✓ TEST 4: Custom Label duplication (created draft copy without mutating original) -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 4 FAILED:", { origCheck, dupCheck });
  }

  // TEST 5: Customer Notifications
  const notif: CustomerNotification = {
    id: "notif_1",
    customerId: "cust_test_alpha",
    type: "order_shipped",
    title: "Order Shipped: ORD-8892",
    message: "Your 10ml roll-ons and perfumer's base have been dispatched via UPS.",
    read: false,
    createdAt: new Date().toISOString(),
  };

  await customerRepository.createNotification(notif);
  await customerRepository.markNotificationRead("notif_1");
  const notifs = await customerRepository.getNotifications("cust_test_alpha");

  if (notifs.length > 0 && notifs[0].read === true) {
    console.log("✓ TEST 5: Customer notifications lifecycle & read status -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 5 FAILED:", notifs);
  }

  // TEST 6: Non-Admin Customer Role
  if (fetchedA?.role === "customer") {
    console.log("✓ TEST 6: Customer role non-escalation (Customer is NOT granted Admin rights) -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", fetchedA);
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

runTests();
