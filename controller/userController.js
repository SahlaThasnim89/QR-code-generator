const QRCode = require("qrcode");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const pdfDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const registerPage = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};

const registerSubmit = async (req, res) => {
  try {
    if (!req.body || !req.body.data) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request body" });
    }

    const { data } = req.body;
    const { fname, lname, email, password, cPassword } = data;
    const user = await prisma.User.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.User.create({
        data: {
          fname,
          lname,
          email,
          password: hashedPassword,
        },
      });
      const defaultSettings = {
        userId: newUser.id,
        generatedTime: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        expiryTime: 30,
        voucherSize: "85.6x53.98",
        fontSize: "Title: 18, Sub: 12, Normal: 10",
        qrCodeSizeStr: "25 × 25 mm",
      };
      await prisma.Settings.create({
        data: defaultSettings,
      });
      req.session.userData = newUser;
      res.status(200).json({
        success: true,
        message: "Registration successful.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login to continue.",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const loginPage = async (req, res) => {
  try {
    if (req.session.userData) {
      return res.redirect("/");
    }
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkUser = await prisma.User.findUnique({
      where: { email },
    });
    if (checkUser) {
      const passwordCheck = await bcrypt.compare(password, checkUser.password);
      if (passwordCheck) {
        req.session.userData = checkUser;
        return res.json({
          success: true,
          message: "Login successful",
          redirectUrl: "/",
        });
      } else {
        return res.json({
          success: false,
          message: "Incorrect password.",
          redirectUrl: "/login",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Email not found.",
        redirectUrl: "/login",
      });
    }
  } catch (error) {
    console.log("Error during login:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error. Please try again later.",
    });
  }
};

const Logout = async (req, res) => {
  req.session.userData = null;
  res.redirect("/login");
};


const dashboard = async (req, res) => {
  try {
    const limit = 5;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const qrCodeData = await prisma.QRCode.findMany({
      where: {
        userId: req.session.userData.id, 
      },
      skip,
      take: limit,
      orderBy: {
        id: "desc",
      },
    });
    res.render("Dashboard", { qrCodeData, page, limit });
  } catch (error) {
    console.log(error.message);
  }
};


const generatePage = async (req, res) => {
  try {
    res.render("generate");
  } catch (error) {
    console.log(error.message);
  }
};



const generate = async (req, res) => {
  const { name } = req.body;
  try {
    const text = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const settings = await prisma.Settings.findUnique({
      where: { userId: req.session.userData.id },
    });
    if (settings) {
      const qrCode = await QRCode.toDataURL(text, {
        color: {
          dark: " #000000",
        },
        width: 200,
      });
      const expiryDate = settings.expiryDate;
      const generatedDate = new Date();
      const qrCodeDetails = await prisma.QRCode.create({
        data: {
          voucherName: name,
          text,
          number: qrCode,
          generatedDate,
          expiryDate,
          userId: req.session.userData.id,
        },
      });
      res.json(qrCodeDetails);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const exportPDF = async (req, res) => {
  try {
    const { voucherID } = req.body;

    const checkQRData = await prisma.QRCode.findUnique({
      where: { id: parseInt(voucherID, 10) },
    });

    const settings = await prisma.Settings.findUnique({
      where: { userId: req.session.userData.id },
    });

    if (!checkQRData || !settings) {
      return res.status(404).send("Voucher not found");
    }

    const [voucherWidth, voucherHeight] = settings.voucherSize
      .split("x")
      .map(Number);
    const fontSizeMatch = settings.fontSize.match(
      /Title:\s*(\d+),\s*Sub:\s*(\d+),\s*Normal:\s*(\d+)/
    );
    const qrCodeSizeMatch = settings.qrCodeSizeStr.match(/(\d+)\s*×\s*(\d+)/);

    const titleFontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 18;
    const subFontSize = fontSizeMatch ? parseInt(fontSizeMatch[2]) : 12;
    const normalFontSize = fontSizeMatch ? parseInt(fontSizeMatch[3]) : 10;
    const qrCodeSize = qrCodeSizeMatch ? parseInt(qrCodeSizeMatch[1]) : 25;

    const pageWidth = voucherWidth * 2.83465;
    const pageHeight = voucherHeight * 2.83465;

    const voucher = {
      title: checkQRData.voucherName,
      generatedDate: checkQRData.generatedDate.toLocaleDateString(),
      expiryDate: checkQRData.expiryDate.toLocaleDateString(),
      qrData: `https://yourwebsite.com/voucher/${checkQRData.id}`,
      code: checkQRData.text,
    };
    const doc = new pdfDocument({
      size: [pageWidth, pageHeight],
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const customFontPath = path.resolve(
      __dirname,
      "../public/assets/font/Poppins-Light.ttf"
    );
    const backgroundImagePath = path.resolve(
      __dirname,
      "../public/assets/img/bg2.jpg"
    );

    doc.registerFont("CustomFont", customFontPath);

    const outputFolder = path.resolve(__dirname, "../public/generated-vouchers");
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // const fileName = `voucher_${checkQRData.voucherName}.pdf`;
    const fileName = path.join(outputFolder, `voucher_${checkQRData.voucherName}.pdf`);
    console.log(fileName)
    const writeStream = fs.createWriteStream(fileName);

    doc.pipe(writeStream);

    doc.image(backgroundImagePath, 0, 0, {
      width: pageWidth,
      height: pageHeight,
    });

    doc
      .font("CustomFont")
      .fontSize(titleFontSize)
      .fillColor("black")
      .text(voucher.title, {
        align: "center",
        underline: true,
        margin: 30,
      });

    doc.moveDown(0.5);

    doc.fontSize(subFontSize).text(`${voucher.code}`, {
      align: "center",
    });

    doc.moveDown(0.2);

    doc
      .fontSize(normalFontSize)
      .text(`Generated On: ${voucher.generatedDate}`, {
        align: "center",
      });

    doc.moveDown(0.2);

    doc.text(`Valid Till: ${voucher.expiryDate}`, {
      align: "center",
    });

    doc.moveDown(1);

    const qrCodeData = await QRCode.toDataURL(voucher.qrData);
    const qrImageBuffer = Buffer.from(qrCodeData.split(",")[1], "base64");

    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = doc.y;

    doc.image(qrImageBuffer, qrCodeX, qrCodeY, {
      width: qrCodeSize,
      height: qrCodeSize,
    });

    doc.end();

    writeStream.on("finish", () => {
        res.download(fileName, (err) => {
        if (err) {
          console.error("Error during download:", err);
        } else {
          console.log("File downloaded successfully.");
          //if you want to store it, remove this unlink 
        fs.unlinkSync(fileName);
        }
      });
      
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF:", err);
      res.status(500).send("Error generating PDF");
    });
  } catch (error) {
    console.error("Error fetching voucher or generating PDF:", error);
  }
};


const makePdf = async (req, res) => {
  try {
    const voucherId = req.params.id;

    const checkQRData = await prisma.QRCode.findUnique({
      where: { id: parseInt(voucherId, 10) },
    });

    const settings = await prisma.Settings.findUnique({
      where: { userId: req.session.userData.id },
    });

    if (!checkQRData || !settings) {
      return res.status(404).send("Voucher not found");
    }

    const [voucherWidth, voucherHeight] = settings.voucherSize
      .split("x")
      .map(Number);
    const fontSizeMatch = settings.fontSize.match(
      /Title:\s*(\d+),\s*Sub:\s*(\d+),\s*Normal:\s*(\d+)/
    );
    const qrCodeSizeMatch = settings.qrCodeSizeStr.match(/(\d+)\s*×\s*(\d+)/);

    const titleFontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 18;
    const subFontSize = fontSizeMatch ? parseInt(fontSizeMatch[2]) : 12;
    const normalFontSize = fontSizeMatch ? parseInt(fontSizeMatch[3]) : 10;
    const qrCodeSize = qrCodeSizeMatch ? parseInt(qrCodeSizeMatch[1]) : 25;

    const pageWidth = voucherWidth * 2.83465;
    const pageHeight = voucherHeight * 2.83465;

    const voucher = {
      title: checkQRData.voucherName,
      generatedDate: checkQRData.generatedDate.toLocaleDateString(),
      expiryDate: checkQRData.expiryDate.toLocaleDateString(),
      qrData: `https://yourwebsite.com/voucher/${checkQRData.id}`,
      code: checkQRData.text,
    };
    const doc = new pdfDocument({
      size: [pageWidth, pageHeight],
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const customFontPath = path.resolve(
      __dirname,
      "../public/assets/font/Poppins-Light.ttf"
    );
    const backgroundImagePath = path.resolve(
      __dirname,
      "../public/assets/img/bg2.jpg"
    );

    doc.registerFont("CustomFont", customFontPath);

    const outputFolder = path.resolve(__dirname, "../public/generated-vouchers");
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // const fileName = `voucher_${checkQRData.voucherName}.pdf`;
    const fileName = path.join(outputFolder, `voucher_${checkQRData.voucherName}.pdf`);
    const writeStream = fs.createWriteStream(fileName);

    doc.pipe(writeStream);

    doc.image(backgroundImagePath, 0, 0, {
      width: pageWidth,
      height: pageHeight,
    });

    doc
      .font("CustomFont")
      .fontSize(titleFontSize)
      .fillColor("black")
      .text(voucher.title, {
        align: "center",
        underline: true,
        margin: 30,
      });

    doc.moveDown(0.5);

    doc.fontSize(subFontSize).text(`${voucher.code}`, {
      align: "center",
    });

    doc.moveDown(0.2);

    doc
      .fontSize(normalFontSize)
      .text(`Generated On: ${voucher.generatedDate}`, {
        align: "center",
      });

    doc.moveDown(0.2);

    doc.text(`Valid Till: ${voucher.expiryDate}`, {
      align: "center",
    });

    doc.moveDown(1);

    console.log("voucher");
    const qrCodeData = await QRCode.toDataURL(voucher.qrData);
    const qrImageBuffer = Buffer.from(qrCodeData.split(",")[1], "base64");

    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = doc.y;

    doc.image(qrImageBuffer, qrCodeX, qrCodeY, {
      width: qrCodeSize,
      height: qrCodeSize,
    });

    doc.end();

    writeStream.on("finish", () => {
      res.download(fileName, () => {
        fs.unlinkSync(fileName);
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF:", err);
      res.status(500).send("Error generating PDF");
    });
  } catch (error) {
    console.error("Error fetching voucher or generating PDF:", error);
  }
};

const settingsPage = async (req, res) => {
  try {
    const settings = await prisma.Settings.findUnique({
      where: { userId: req.session.userData.id },
    });

    if (settings) {
      const generatedDate = new Date(settings.generatedTime);
      const expiryDate = new Date(settings.expiryDate);
      const timeDifference = expiryDate - generatedDate;
      const validity = Math.ceil(timeDifference / (1000 * 3600 * 24));
      res.render("Settings", { settings, validity });
    } else if (!settings || settings == null) {
      res.render("Settings");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const settupSettings = async (req, res) => {
  try {
    const { expiryTime, voucherSize, fontSize, qrCodeSize } = req.body;
    if (!expiryTime || !voucherSize || !fontSize || !qrCodeSize) {
      throw new Error("All fields are required");
    }

    const expiryDays = parseInt(expiryTime, 10);
    const currentDate = new Date();
    const expiryDate = new Date(
      currentDate.setDate(currentDate.getDate() + expiryDays)
    );

    let settings = await prisma.Settings.findUnique({
      where: { userId: req.session.userData.id },
    });

    if (settings) {
      const newSettings = await prisma.Settings.update({
        where: { userId: req.session.userData.id },
        data: {
          expiryDate,
          expiryDate,
          voucherSize,
          fontSize,
          qrCodeSizeStr: qrCodeSize,
        },
      });
      res.redirect("/generate");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const page404 = async (req, res) => {
  res.render("404");
};

module.exports = {
  registerPage,
  registerSubmit,
  loginPage,
  loginUser,
  dashboard,
  generatePage,
  generate,
  makePdf,
  Logout,
  settingsPage,
  settupSettings,
  exportPDF,
  page404,
};
