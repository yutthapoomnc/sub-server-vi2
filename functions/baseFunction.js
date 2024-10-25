// Log the results of the bulk write operation
const logBulkWriteResult = (result, main_name) => {
  console.log(
    JSON.stringify(
      {
        message: `Batch received for ${main_name}`,
        upserted: `${result.upsertedCount} targets upserted`,
        matched: `${result.matchedCount} targets matched`,
        modified: `${result.modifiedCount} targets modified`,
      },
      null,
      2
    )
  );
};

// Log the results of the vehicle bulk write operation
const logVehicleBatchResult = (result) => {
    console.log(
      JSON.stringify(
        {
          message: `Batch received for ${clientName}`,
          upserted: `${result.upsertedCount} vehicles upserted`,
          matched: `${result.matchedCount} vehicles matched`,
          modified: `${result.modifiedCount} vehicles modified`,
        },
        null,
        2
      )
    );
  };