import React, { useEffect, useState } from "react";
import "./App.css";
import { DataGrid } from "@mui/x-data-grid";
import {ArrowDropDown, ArrowDropUp, ArrowForwardIos, ArrowRight, ArrowRightAlt, Iso, Star, StarBorder} from '@mui/icons-material/';
import axios from "axios";
import { ButtonBase, Card, TextField } from "@mui/material";

let getRowsCallCount = 0;
let latestSearchKeyword = '';

function App() {
  const pageSize = 6;
  const [paginationModel, setPaginationModel] = useState({ pageSize, page: 0 });
  const [locationNames, setLocationNames] = useState<{name: string; count: number;}[]>([]);
  const [totalLocationCount, setTotalLocationCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isOpenLocationSelect, setIsOpenLocationSelect] = useState(false);
  const [activeLocationName, setActiveLocationName] = useState('');
  const [locationNameSearchKeyword, setLocationNameSearchKeyword] = useState('');
  
  // DataGrid 컬럼 속성
  const columns = [
    {
      field: '',
      width: 50,
      sortable: false,
      renderCell(params: any) {
        return (
          <ButtonBase className="btn-star">
            <StarBorder></StarBorder>
          </ButtonBase>
        )
      }
    },
    { 
      field: 'Locations', 
      width: 400,
      sortable: false,
      renderCell(params: any) {
        const robot = params.row.robot;
        return (
          <div className={`location-wrap ${robot && robot.is_online ? 'active' : ''}`}>
            {params.row.name}
            <div className="icon">
              <ArrowForwardIos style={{width: 16}}></ArrowForwardIos>
            </div>
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

  // http 요청으로 로케이션 정보 가져오는 함수
  const getRows = async (page: any, searchKeyword: any, locationName = '') => {
    return new Promise(async (resolve, reject) => {
      // pk 변수는 요청에 대한 Primary Key 값으로 비동기 작업 중에 새로운 요청이 오면,
      // 가장 마지막 요청의 대한 응답 값을 최종 적용 하기 위해 사용 합니다.
      const pk = ++ getRowsCallCount;

      try {
        const res = await axios.get("/locations", {params: {page: page, searchKeyword, location_name: locationName}});
        if (pk === getRowsCallCount) {
          const data = res.data;
          
          // 이 코드는 넣고 싶지는 않았는데, 라이브러리 레벨에서 page * 페이지사이즈 의 인덱스 부터 rows 배열을 읽어서 데이터가 짤려나와 추가 하였습니다.
          // 실제 실무 상황이었다면 시간을 좀 들여 라이브러리 속성을 리서칭 했을 것 같습니다.
          data.locations.unshift(...([...new Array(page * (pageSize))].map(item=>({id: Math.random()}))));

          console.log(data.locations);
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

  // 로케이션 선택 검색을 위해 로케이션 이름 데이터를 가져옵니다.
  const getLocationNames = async () => {
    try{
      const res = (await axios.get<any>('/locationnames'));
      setLocationNames(res.data.data);
      setTotalLocationCount(res.data.total);
    } catch(e) {
      console.log(e);
    }
  };

  // 페이지네이션 정보가 변경되었을 때 로케이션 정보를 새로가져옵니다.
  const onChangePageNation = (value: any) => {
    setPaginationModel(value);
    getRows(value.page, searchKeyword);
  }

  // 이니셜라이징 데이터 요청
  useEffect(()=>{ getLocationNames(); }, []);
  useEffect(()=>{ getRows(0, ''); }, []);

  // 0.5초 마다 검색어 변경 감지 및 값 변경 시 검색요청
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
          setPaginationModel({ page: 0, pageSize });
          await getRows(0, searchKeyword);
        } catch(e) { }
      }
      // 0.5초 마다 검색
      setTimeout(run, 500);
    };
    run();
    return () => {isend = true};
  }, [searchKeyword]);

  // 렌더
  return (
    <div className="App">
      <h2>Your Fleet</h2>
      <div className="search-box">
        <div className={"location-select-wrap " + (isOpenLocationSelect ? 'active' : '')}>
          <ButtonBase
            className="btn-location-select"
            onClick={()=>setIsOpenLocationSelect(!isOpenLocationSelect)}
          >
            <div>{activeLocationName ? activeLocationName : 'All Location'}</div>
            <div style={{flex: 1}}></div>
            { isOpenLocationSelect? (<ArrowDropUp />) : <ArrowDropDown />}
          </ButtonBase>
          {
            isOpenLocationSelect ? (
              <div className="popup">
                <Card className="popup-card">
                  <div style={{padding: `10px`}}>
                    <TextField size="small" label="Search Group" style={{width: '100%'}} onChange={e=>setLocationNameSearchKeyword(e.target.value)}></TextField>
                  </div>
                  <ButtonBase className={"btn " + (!activeLocationName ? 'active' : '')}
                      onClick={()=> {
                        setActiveLocationName('');
                        setIsOpenLocationSelect(false);
                     
                        setPaginationModel({ page: 0, pageSize });
                        getRows(0, searchKeyword, '');
                      }}>
                    All Locations ({totalLocationCount})
                    </ButtonBase>
                  <ButtonBase className="btn">
                    <Star className="icon-star"></Star>
                    <span>Starred</span>
                  </ButtonBase>
                  {
                    locationNames
                      .filter(item => !locationNameSearchKeyword || item.name.toLowerCase().includes(locationNameSearchKeyword.toLowerCase()))
                      .map(item => (
                        <ButtonBase key={item.name} className={'btn ' + (item.name === activeLocationName ? 'active' : '')}
                        onClick={()=> {
                          setActiveLocationName(item.name);
                          setIsOpenLocationSelect(false);
                      
                          setPaginationModel({ page: 0, pageSize });
                          getRows(0, searchKeyword, item.name);
                        }}>
                          {item.name} ({item.count})
                        </ButtonBase>
                      ))
                  }
                </Card>
              </div>
            ) : null
          }
        </div>
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
