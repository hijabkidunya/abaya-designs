import { NextResponse } from "next/server"
import { auth } from "@/lib/authOptions"
import dbConnect from "@/lib/mongodb"
import Order from "@/lib/models/Order"
import Product from "@/lib/models/Product"
import { sendMail } from "@/lib/server/mail";
import User from "@/lib/models/User"; // Added import for User model

export async function POST(req) {
  try {
    await dbConnect()
    let session = null;
    try {
      session = await auth();
    } catch (e) {
      session = null;
    }
    // Remove strict session requirement; allow guests
    const data = await req.json()
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "province",
      "zipCode",
      "country",
      "paymentMethod",
      "items",
      "total"
    ]
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].toString().trim())) {
        return NextResponse.json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.` }, { status: 400 })
      }
    }
    // Email validation
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(data.email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    // Phone validation
    if (!/^\+?\d{10,15}$/.test(data.phone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Please enter a valid phone number (10-15 digits)." }, { status: 400 })
    }
    // Bank confirmation if payment method is bank
    if (data.paymentMethod === "bank" && !data.bankConfirmed) {
      return NextResponse.json({ error: "You must confirm the bank transfer." }, { status: 400 })
    }
    // Check stock for each item
    for (const item of data.items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }
    }

    // Find or create guest user if no session
    let userId = null;
    if (!session || !session.user) {
      try {
        // Find existing guest user by email
        let guestUser = await User.findOne({ email: data.email });

        if (!guestUser) {
          // Create new guest user if not found
          guestUser = new User({
            email: data.email,
            name: `${data.firstName} ${data.lastName}`,
            isGuest: true,
            role: "user",
            guestDetails: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              address: data.address,
              city: data.city,
              province: data.province,
              zipCode: data.zipCode,
              country: data.country,
              lastOrderDate: new Date()
            }
          });
          await guestUser.save();
        } else {
          // Update existing guest user details
          guestUser.name = `${data.firstName} ${data.lastName}`;
          guestUser.guestDetails = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.address,
            city: data.city,
            province: data.province,
            zipCode: data.zipCode,
            country: data.country,
            lastOrderDate: new Date()
          };
          await guestUser.save();
        }

        userId = guestUser._id;
      } catch (err) {
        console.error("Error creating/updating guest user:", err);
        // Continue with order creation even if guest user creation fails
      }
    } else {
      userId = session.user.id;
    }

    // Map items to the format expected by the Order model
    const orderItems = data.items.map(item => {
      // Ensure all required fields are present
      if (!item.productId) {
        console.error("Missing productId in order item:", item);
        throw new Error("Invalid order item: missing product ID");
      }

      return {
        product: item.productId,
        quantity: item.quantity || 1,
        size: item.size || '',
        color: item.color || '',
        price: item.price || 0,
      };
    });

    // Determine payment status based on payment method and confirmation
    let paymentStatus = "pending";
    if (data.paymentMethod === "bank" && data.bankConfirmed) {
      paymentStatus = "paid";
    } else if (data.paymentMethod === "cod") {
      paymentStatus = "pending";
    }

    // Save order to database
    const order = await Order.create({
      user: userId, // Use the determined userId
      isGuestOrder: !session || !session.user,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      items: orderItems,
      shippingAddress: {
        street: data.address,
        city: data.city,
        state: data.province,
        zipCode: data.zipCode,
        country: data.country,
      },
      paymentMethod: data.paymentMethod,
      selectedBankAccount: data.selectedBankAccount || "ubl",
      paymentStatus: paymentStatus,
      orderStatus: "pending",
      total: data.total,
    })
    // Decrement stock for each item
    for (const item of data.items) {
      // Decrement stock
      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      // If stock is now 0 or less, set inStock to false
      if (updatedProduct && updatedProduct.stock - item.quantity <= 0) {
        await Product.findByIdAndUpdate(item.productId, { inStock: false, stock: 0 });
      } else if (updatedProduct && updatedProduct.stock - item.quantity > 0) {
        await Product.findByIdAndUpdate(item.productId, { inStock: true });
      }
    }

    // Send order confirmation email to user and admin
    // Fetch product names for email
    const itemsWithDetails = await Promise.all(data.items.map(async (item) => {
      if (item.name) return item;

      try {
        const product = await Product.findById(item.productId);
        return {
          ...item,
          name: product ? product.name : `Product #${item.productId}`
        };
      } catch (err) {
        return {
          ...item,
          name: `Product #${item.productId}`
        };
      }
    }));

    const orderItemsHtml = itemsWithDetails.map(item => `
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #eee; text-align:center;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #eee; text-align:right;">Rs ${item.price.toLocaleString("en-PK")}</td>
          </tr>
        `).join("");

    const orderHtml = `
          <div style="font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif; background: #f9fafb; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #e5e7eb; overflow: hidden;">
              <div style="background: #e0c3fc; background: linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%); padding: 24px 32px; text-align: center;">
                <img src='https://abayadesigns.com/logo_light.png' alt='Abaya Designs' style='height: 48px; margin-bottom: 8px;' />
                <h1 style="margin: 0; font-size: 2rem; color: #22223b;">Thank you for your order!</h1>
                <p style="margin: 0; color: #4a4e69;">Order Confirmation</p>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #22223b;">Order Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  <thead>
                    <tr style="background: #f1f5f9;">
                      <th style="padding: 8px; border: 1px solid #eee; text-align:left;">Product</th>
                      <th style="padding: 8px; border: 1px solid #eee; text-align:center;">Qty</th>
                      <th style="padding: 8px; border: 1px solid #eee; text-align:right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHtml}
                  </tbody>
                </table>
                <p style="font-size: 1.1rem; color: #22223b;"><strong>Total:</strong> Rs ${data.total.toLocaleString("en-PK")}</p>
                <h3 style="margin-top: 32px; color: #22223b;">Shipping Information</h3>
                <p style="margin: 0;">${data.firstName} ${data.lastName}<br/>
                ${data.address}, ${data.city}, ${data.province}, ${data.zipCode}, ${data.country}<br/>
                Phone: ${data.phone}<br/>
                Email: ${data.email}</p>
                <p style="margin-top: 32px; color: #4a4e69;">If you have any questions, reply to this email or contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #8ec5fc; text-decoration: underline;">${process.env.EMAIL_USER}</a>.</p>
              </div>
              <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; color: #4a4e69; font-size: 0.95rem;">
                &copy; ${new Date().getFullYear()} Abaya Designs. All rights reserved.
              </div>
            </div>
          </div>
        `;
    // Create separate email templates for customer and admin

    // Customer email - Professional, clean design
    const customerEmailHtml = `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src='https://e7.pngegg.com/pngimages/835/277/png-clipart-hijab-islam-graphy-hijab-face-monochrome.png' alt='Abaya Designs' style='height: 60px;' />
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333333; margin-bottom: 15px; font-size: 22px;">Thank You for Your Order!</h2>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 20px;">Dear ${data.firstName} ${data.lastName},</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 20px;">We're pleased to confirm that we've received your order. We'll notify you once your items have been shipped.</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 20px;"><strong>Order Reference:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f8f8f8;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; color: #333333;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0; color: #333333;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0; color: #333333;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsWithDetails.map(item => `
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #666666;">${item.name}</td>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666666;">${item.quantity}</td>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #666666;">Rs ${item.price.toLocaleString("en-PK")}</td>
                    </tr>
                  `).join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; color: #333333;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #333333;">Rs ${data.total.toLocaleString("en-PK")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Shipping Details</h3>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">${data.firstName} ${data.lastName}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">${data.address}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">${data.city}, ${data.province} ${data.zipCode}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">${data.country}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">Phone: ${data.phone}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Payment Method</h3>
              <p style="color: #666666; line-height: 1.5;">${data.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer / Card Payment'}</p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="color: #999999; font-size: 14px;">If you have any questions about your order, please contact our customer service team at 0349-6098882 (WhatsApp) style="color: #666666; text-decoration: underline;">${process.env.EMAIL_USER}</a>.</p>
              <p style="color: #999999; font-size: 14px; margin-top: 20px;">&copy; ${new Date().getFullYear()} Abaya Designs. All rights reserved.</p>
            </div>
          </div>
        `;

    // Admin email - More detailed, business-focused
    const adminEmailHtml = `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src='https://abayadesigns.com/logo_dark.png' alt='Abaya Designs' style='height: 60px;' />
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333333; margin-bottom: 15px; font-size: 22px;">New Order Received</h2>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 20px;"><strong>Order ID:</strong> ${order._id}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 20px;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 20px;"><strong>Payment Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer / Card Payment'}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Customer Information</h3>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;"><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;"><strong>Email:</strong> ${data.email}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;"><strong>Phone:</strong> ${data.phone}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;"><strong>User Type:</strong> ${session && session.user ? 'Registered User' : 'Guest Checkout'}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;"><strong>User ID:</strong> ${session && session.user ? session.user.id : 'Guest (No ID)'}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Shipping Address</h3>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">${data.address}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">${data.city}, ${data.province} ${data.zipCode}</p>
              <p style="color: #666666; line-height: 1.5; margin-bottom: 5px;">${data.country}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f8f8f8;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; color: #333333;">Product ID</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; color: #333333;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0; color: #333333;">Qty</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0; color: #333333;">Size/Color</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0; color: #333333;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsWithDetails.map(item => `
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #666666;">${item.productId}</td>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #666666;">${item.name}</td>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666666;">${item.quantity}</td>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666666;">${item.size || 'N/A'} / ${item.color || 'N/A'}</td>
                      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #666666;">Rs ${item.price.toLocaleString("en-PK")}</td>
                    </tr>
                  `).join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold; color: #333333;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #333333;">Rs ${data.total.toLocaleString("en-PK")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px;">This is an automated notification. Please process this order according to standard procedures.</p>
              <p style="color: #666666; font-size: 14px; margin-top: 10px;">Order management system: <a href="${process.env.NEXT_PUBLIC_URL || 'https://abayadesigns.com'}/admin" style="color: #666666; text-decoration: underline;">Admin Dashboard</a></p>
            </div>
          </div>
        `;

    try {
      await sendMail({
        to: data.email,
        subject: `Your Order Confirmation - Abaya Designs`,
        html: customerEmailHtml,
      });
      await sendMail({
        to: process.env.EMAIL_USER,
        subject: `New Order #${order._id.toString().slice(-6).toUpperCase()} - Abaya Designs`,
        html: adminEmailHtml,
      });
    } catch (mailErr) {
      // Log but do not block order creation
      console.error("Order email failed:", mailErr);
    }
    return NextResponse.json({ message: "Order placed successfully!", order }, { status: 201 })
  } catch (err) {
    console.error("Order creation error:", err.message, err.stack);
    return NextResponse.json({ error: "Server error. Please try again later." }, { status: 500 })
  }
}

export async function GET(req) {
  await dbConnect()
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    // If admin, return all orders
    if (session.user.role === "admin") {
      const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .populate("user", "email name")
        .populate("items.product")
      return NextResponse.json({ orders })
    }
    // Otherwise, return only user's orders
    const orders = await Order.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product")
    return NextResponse.json({ orders })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// New handler for /api/orders/all
export async function GET_ALL(req) {
  await dbConnect()
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "email name")
      .populate("items.product")
    return NextResponse.json({ orders })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
} 