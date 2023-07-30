import { DefaultBodyType, rest } from "msw";

import { Location, locations } from "./db";

interface LocationsResult {
  total_count: number;
  locations: Location[];
}

interface LocationsPathParams {
  page: string;
  location_name: string;
  robot_id: string;
  starredIds: string;
  searchKeyword: string;
}

export const handlers = [

  // 셀렉트 박스에 출력할 로케이션 이름 리스트 데이터 API 추가
  rest.get<DefaultBodyType, any, any>(
    "/locationnames",
    (req, res, ctx) => {
      const counts: any = {};
      locations.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + 1;
      });
      const data = Object.keys(counts).sort().map(name => ({name, count: counts[name]}));
      return res(ctx.status(200), ctx.json({
        data,
        total: data.map(item=>item.count).reduce((a,b)=>a+b, 0)
      }));
    }
  ),

  rest.get<DefaultBodyType, LocationsPathParams, LocationsResult>(
    "/locations",
    (req, res, ctx) => {
      // Please implement filtering feature here
      let list = [...locations];
      
      let searchKeyword: any = req.url.searchParams.get('searchKeyword');
      let location_name: any = req.url.searchParams.get('location_name');
      // 문제 출제는 is_starred 로 되있었는데
      // 앞글자가 is 이기 때문에 boolean 값의 의도로 비춰지는데요.
      // starred_location_ids 를 비춰보았을 때 지금 구성된 백엔드에서는
      // 유저의 북마크정보를 가지고있지 않는 상태이기 때문에
      // 프론트에서 북마크정보들을 전달해주는게 맞습니다.
      // 필드명만 봤을 땐 백엔드에서 각 유저의 북마크 정보를 판단하라는 의도로 보여서
      // 이 부분은 인터페이스 변경했습니다.
      let starredIds: any = req.url.searchParams.get('starredIds');
      let robot_id: any = req.url.searchParams.get('robot_id');
      let page: any = Number(req.url.searchParams.get('page'));

      // 페이지 값 Numberlize 안되는 값이면 에러
      if (isNaN(page) || page < 0) {
        return res(ctx.status(400));
      }

      if (starredIds) {
        try {
          // json parse 실패할 수도 있기때문에 try catch 습관화
          starredIds = starredIds.split(',').map((item: any)=>Number(item));
          list = list.filter(item => starredIds.includes(item.id));
        } catch( e) {
        }
      }
      else if (location_name) {
        list = list.filter(item => item.name === location_name);
      }
      if (searchKeyword) {
        list = list.filter(item => {
          return item.name.split(' ').join().toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (item.robot && item.robot.id.split(' ').join().toLowerCase().includes(searchKeyword.toLowerCase()))
        });
      }

      const total_count = list.length;
      list = list.slice(page * 6, page * 6 + 6);
      
      const result: LocationsResult = {
        total_count,
        locations: list,
      };

      return res(ctx.status(200), ctx.json(result));
    }
  ),

  rest.get("/starred_location_ids", (req, res, ctx) => {
    const location_ids = JSON.parse(
      sessionStorage.getItem("starred_location_ids") || "[]"
    );

    return res(
      ctx.status(200),
      ctx.json({
        location_ids,
      })
    );
  }),

  rest.put("/starred_location_ids", (req, res, ctx) => {
    if (!req.body) {
      return res(
        ctx.status(500),
        ctx.json({ error_msg: "Encountered unexpected error" })
      );
    }

    sessionStorage.setItem("starred_location_ids", JSON.stringify(req.body));

    return res(ctx.status(204));
  }),
];
