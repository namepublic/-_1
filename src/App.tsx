import React, { useEffect, useState } from "react";
import "./App.css";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

let getRowsCallCount = 0;

function App() {
  const [totalCount, setTotalCount] = useState(null);
  const [rows, setRows] = useState([]);
  const columns = [
    { field: 'Locations', valueGetter: (params: any) => params.row.name, width: 400 },
    { field: 'Robots', width: 200},
    { field: 'Location Types', width: 400 },
  ];

  const getRows = async () => {
    // pk 변수는 요청에 대한 Primary Key 값으로 비동기 작업 중에 새로운 요청이 오면,
    // 가장 마지막 요청의 대한 응답 값을 최종 적용 하기 위해 사용 합니다.
    const pk = ++ getRowsCallCount;

    try {
      const res = await axios.get("/locations");
      if (pk === getRowsCallCount) {
        const data = res.data;
        console.log(data)
        setRows(data.locations);
        setTotalCount(data.total_count);
      }
    } catch(e) {
      console.log(e);
    }
  };

  useEffect(()=>{ getRows(); }, []);

  return (
    <div className="App">
      <h2>Your Fleet</h2>
      <div className="search-box">
        <div></div>
        <div style={{flex: 1}}></div>
        <div></div>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </div>
  );
}

export default App;
