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
  is_starred: string;
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
      let robot_id: any = req.url.searchParams.get('robot_id');
      let page: any = Number(req.url.searchParams.get('page'));

      // 페이지 값 Numberlize 안되는 값이면 에러
      if (isNaN(page) || page < 0) {
        return res(ctx.status(400));
      }

      if (location_name) {
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
