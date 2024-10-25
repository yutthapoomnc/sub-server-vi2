const mainServer = process.env.MAIN_SERVER;
const { initializeMongoDB } = require("./mongoClient");

let mongoClient, db;
// Handle synchronization requests for vehicles
const handleSyncVehicle = (data) => {
  console.log(`Received sync vehicle request from ${data.main_name}`);
};

// Handle socket disconnection
const handleDisconnect = () => {
  console.log(`Disconnected from ${mainServer}`);
  if (mongoClient) mongoClient.close();
};

const syncVehicleData = async (
  socket,
  client_name,
  ipv4_address,
  updatedVehicles
) => {
  try {
    console.log(`Syncing vehicle data for ${client_name} at ${ipv4_address}`);

    // สมมุติว่าเราเก็บข้อมูลยานพาหนะลงใน MongoDB
    const collection = db.collection(vehicleCollectionName);
    const operations = updatedVehicles.map((vehicle) => ({
      updateOne: {
        filter: { _id: vehicle._id },
        update: { $set: vehicle },
        upsert: true, // ใช้ upsert เพื่อสร้างข้อมูลใหม่ถ้ายังไม่มี
      },
    }));

    const result = await collection.bulkWrite(operations);
    console.log(`Successfully synced vehicle data for ${client_name}:`, result);

    // ส่งการตอบกลับไปยังเซิร์ฟเวอร์หลัก (ถ้าจำเป็น)
    // socket.emit("sync-success", { client_name, status: "success" });
    sendAcknowledgment(result);
  } catch (error) {
    console.error("Error during vehicle data sync:", error.message);

    // ส่งการตอบกลับในกรณีที่เกิดข้อผิดพลาด
    socket.emit("sync-failure", {
      client_name,
      status: "failure",
      error: error.message,
    });
  }
};

// การจัดการการแทรกข้อมูล Target
const handleTargetInserted = async (data) => {
  const { main_name, targetData } = data;
  console.log(`New target data received from ${main_name}:`, targetData);

  const collection = db.collection(targetCollectionName);
  try {
    // สร้าง targetDataArray จาก targetData
    const targetDataArray = targetData.map((target) => ({
      _id: target.target_type_id, // หรือใช้ _id ที่ต้องการ
      ...target, // รวมคุณสมบัติอื่น ๆ ของ target
    }));

    const operations = targetDataArray.map((target) => ({
      updateOne: {
        filter: { _id: target._id },
        update: { $set: target },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    logBulkWriteResult(result, main_name);
    sendAcknowledgment(targetDataArray);
  } catch (error) {
    console.error("Error processing target data:", error.message);
  }
};

// Request initial data from the main server
const handleSyncRequest = async ({
  client_name,
  ipv4_address,
  updatedVehicles,
}) => {
  try {
    console.log(`Received sync request from ${client_name}`);
    await syncVehicleData(socket, client_name, ipv4_address, updatedVehicles);
  } catch (error) {
    console.error("Sync error:", error);
  }
};

// การจัดการการแทรกข้อมูล vehicle
const handleVehicleInserted = async (data) => {
  const { main_name, vehicleData } = data;
  console.log(`New target data received from ${main_name}:`, vehicleData);

  const collection = db.collection(vehicleCollectionName);
  try {
    // สร้าง vehicleDataArray จาก vehicleData
    const vehicleDataArray = vehicleData.map((vehicle) => ({
      _id: vehicle._id, // หรือใช้ _id ที่ต้องการ
      ...vehicle, // รวมคุณสมบัติอื่น ๆ ของ vehicle
    }));

    const operations = vehicleDataArray.map((vehicle) => ({
      updateOne: {
        filter: { _id: vehicle._id },
        update: { $set: vehicle },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    logBulkWriteResult(result, main_name);
    sendAcknowledgment(vehicleDataArray);
  } catch (error) {
    console.error("Error processing target data:", error.message);
  }
};

// Handle incoming batch data for vehicles
const handleDataBatch = async ({ data, progress }) => {
  console.log(
    `Received batch data for ${clientName} with progress: ${progress}%`
  );

  const collection = db.collection(process.env.COLLECTION_NAME);
  try {
    const operations = data.map((vehicle) => ({
      updateOne: {
        filter: { _id: vehicle._id },
        update: { $set: vehicle },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    logVehicleBatchResult(result);
  } catch (error) {
    console.error("Error upserting batch data:", error.message);
  }
};

module.exports = {
  handleSyncVehicle,
  handleDisconnect,
  syncVehicleData,
  handleTargetInserted,
  handleSyncRequest,
  handleVehicleInserted,
  handleDataBatch,
};
