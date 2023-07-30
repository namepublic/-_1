import React, { useEffect, useState } from "react";
import "./App.css";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { TextField } from "@mui/material";

let getRowsCallCount = 0;
let latestSearchKeyword = '';
let isRunningSearchThread = false;

function App() {
  const [paginationModel, setPaginationModel] = useState({ pageSize: 6,  page: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const columns = [
    { 
      field: 'Locations', 
      width: 400,
      sortable: false,
      renderCell(params: any) {
        const robot = params.row.robot;
        return (
          <div className={`location-wrap ${robot && robot.is_online ? 'active' : ''}`}>
            {params.row.name}
          </div>
        );
      }
    },
    { 
      field: 'Robots',
      width: 200,
      sortable: false,
      renderCell(params: any) {
        const robot = params.row.robot;
        if (robot) {
          return (
            <div className="robot-wrap active">
              {params.row.robot.id}
            </div>
          );
        } else {
          return (
            <div className="robot-wrap">
              <div className="link">Add</div>
            </div>
          )
        }
      }
    },
    { field: 'Location Types', width: 400, sortable: false },
  ];

  const getRows = async (page: any, searchKeyword: any) => {
    return new Promise(async (resolve, reject) => {
      // pk 변수는 요청에 대한 Primary Key 값으로 비동기 작업 중에 새로운 요청이 오면,
      // 가장 마지막 요청의 대한 응답 값을 최종 적용 하기 위해 사용 합니다.
      const pk = ++ getRowsCallCount;

      try {
        const res = await axios.get("/locations", {params: {page: page, searchKeyword}});
        if (pk === getRowsCallCount) {
          const data = res.data;
          console.log(data)
          setRows(data.locations);
          setTotalCount(data.total_count);
        }
        resolve(null);
      } catch(e) {
        console.log(e);
        reject(e);
      }
    })
  };

  const onChangePageNation = (value: any) => {
    setPaginationModel(value);
  }

  useEffect(()=>{ getRows(0, ''); }, []);
  useEffect(() => {
    let isend = false;
    const run = async () => {
      if (isend) {
        // useEffect 함수 다시 호출
        // searchKeyword 갱신
        // 이전 루프 삭제
        return;
      }
      if (latestSearchKeyword !== searchKeyword) {
        latestSearchKeyword = searchKeyword;
        try {
          // 검색을 새로 시작할 때는 페이지 0으로 돌린다.
          await getRows(0, searchKeyword);
        } catch(e) { }
      }
      // 0.5초 마다 검색
      setTimeout(run, 500);
    };
    run();
    return () => {isend = true};
  }, [searchKeyword]);

  return (
    <div className="App">
      <h2>Your Fleet</h2>
      <div className="search-box">
        <div></div>
        <div style={{flex: 1}}></div>
        <div>
          <TextField 
          label="Search robot or location"
          onChange={e=>setSearchKeyword(e.target.value.trim())} />
        </div>
      </div>
      <DataGrid
        rows={rows}
        rowCount={totalCount}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={onChangePageNation}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnMenu
      />
    </div>
  );
}

export default App;
