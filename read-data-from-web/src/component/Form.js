import useSortableData from '../util/hook/useSortable'
import '../style/Form.css';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState, useEffect, useRef } from "react";

export default function Form(props) {
  const [data, setData] = useState([]);
  const page = useRef();
  useEffect(() => {
    page.current = 1
    fetchData(page.current);
  }, [])

  const fetchData = (currentPage) => {
    fetch(`http://34.80.106.246/wp-json/homework/query?page=${currentPage}`, { method: 'GET' })
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json();
      })
      .then((itemList) => {
        if (!_.isEmpty(itemList)) {
          setData(preData => [...preData, ...itemList]);
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const { items, requestSort, sortConfig } = useSortableData(data);
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={() => fetchData(++page.current)}
      hasMore={true}
      loader={<h4>Loading...</h4>}
    >
      <table>
        <caption>Read-data-from-web</caption>
        <thead>
          <tr>
            <th>
              <button
                type="button"
                onClick={() => requestSort("user_id")}
                className={getClassNamesFor("user_id")}
              >
                員工ID
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("first_area_of_the_day")}
                className={getClassNamesFor("first_area_of_the_day")}
              >
                出現最早的區域
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("first_area_timestamp")}
                className={getClassNamesFor("first_area_timestamp")}
              >
                最早的時間
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("last_area_of_the_day")}
                className={getClassNamesFor("last_area_of_the_day")}
              >
                出現最晚的區域
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("last_area_timestamp")}
                className={getClassNamesFor("last_area_timestamp")}
              >
                最晚的時間
              </button>
            </th>
            <th>
              <p>影像</p>
            </th>
          </tr>
        </thead>

        <tbody>
          {!_.isEmpty(items) && items.map((data, i) => (
            <tr key={i}>
              <td>{data.user_id}</td>
              <td>{data.first_area_of_the_day}</td>
              <td>{data.first_area_timestamp}</td>
              <td>{data.last_area_of_the_day}</td>
              <td>{data.last_area_timestamp}</td>
              <td><img src={data.snapshot} alt="X" /></td>
            </tr>
          ))}

        </tbody>
      </table>
    </InfiniteScroll>
  );
}