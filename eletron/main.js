const { app, BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")
const { XMLParser } = require("fast-xml-parser")
const { SerialPort } = require("serialport")

let win
let serialPort = null
const isDev = !app.isPackaged

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) win.loadURL("http://localhost:5173")
  else win.loadFile(path.join(__dirname, "../dist/index.html"))
}

function getConfigPath() {
  return path.join(process.cwd(), "config.xml")
}

async function detectComPort() {
  const ports = await SerialPort.list()
  for (const p of ports) {
    if (p.friendlyName?.includes("USB") || p.manufacturer?.includes("USB"))
      return p.path
  }
  return null
}

function connectSerial(portName, baudRate) {
  try {
    serialPort = new SerialPort({ path: portName, baudRate })

    serialPort.on("open", () => {
      win.webContents.send("serial-status", "CONNECTED")
    })

    serialPort.on("data", data => {
      win.webContents.send("serial-data", data.toString())
    })

    serialPort.on("close", () => {
      win.webContents.send("serial-status", "DISCONNECTED")
      setTimeout(() => connectSerial(portName, baudRate), 1000)
    })

    serialPort.on("error", () => {
      win.webContents.send("serial-status", "ERROR")
      setTimeout(() => connectSerial(portName, baudRate), 1000)
    })
  } catch {
    setTimeout(() => connectSerial(portName, baudRate), 1000)
  }
}

async function loadSerialConfig() {
  try {
    const xml = fs.readFileSync(getConfigPath(), "utf8")
    const cfg = new XMLParser().parse(xml)

    let portName = cfg.config.serial.port
    const baudRate = Number(cfg.config.serial.baud)

    const ports = await SerialPort.list()
    const available = ports.map(p => p.path)

    if (!available.includes(portName)) {
      const auto = await detectComPort()
      if (!auto) {
        win.webContents.send("serial-status", "NO_DEVICE")
        return
      }
      portName = auto
    }

    connectSerial(portName, baudRate)
  } catch (err) {
    win.webContents.send("serial-status", "CONFIG_ERROR")
  }
}

app.whenReady().then(() => {
  createWindow()
  setTimeout(() => loadSerialConfig(), 1000)
})

app.on("window-all-closed", () => {
  if (serialPort && serialPort.isOpen) serialPort.close()
  app.quit()
})
