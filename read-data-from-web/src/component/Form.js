import '../style/Form.css';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState, useEffect, useRef, useMemo } from "react";

export default function Form(props) {
  const buttonNames = ['user_id', 'first_area_of_the_day', 'first_area_timestamp', 'last_area_of_the_day', 'last_area_timestamp'];
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "user_id", direction: "ASC" });
  const page = useRef();
  useEffect(() => {
    page.current = 1
    fetchData(page.current);
  }, [])

  const fetchData = (currentPage, newSortConfig = null) => {
    fetch(`http://34.80.106.246/wp-json/homework/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: currentPage,
        orderBy: (newSortConfig || sortConfig).key,
        direction: (newSortConfig || sortConfig).direction,
        filter
      })
    })
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json();
      })
      .then((itemList) => {
        if (!_.isEmpty(itemList)) {
          setData(preData => [...preData, ...itemList]);
        }

        if (_.isEmpty(itemList) || itemList.length < 30) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const getClassNamesFor = name => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const requestSort = (key) => {
    let direction = "ASC";
    if (
      sortConfig.key === key &&
      sortConfig.direction === "ASC"
    ) {
      direction = "DESC";
    }
    const newSortConfig = { key, direction }
    setSortConfig(newSortConfig);
    refetch(newSortConfig);
  };

  const refetch = (newSortConfig) => {
    setData([]);
    page.current = 1;
    fetchData(page.current, newSortConfig);
    window.scrollTo(0, 0);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      refetch(sortConfig)
    }
  }

  return (
    <div className="form" >
      <input
        className="filter"
        maxLength='100'
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="press Enter"
        onKeyDown={handleKeyDown}
      />
      <InfiniteScroll
        dataLength={data.length}
        next={() => fetchData(++page.current)}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        <table>
          <thead>
            <tr>
              {_.map(buttonNames, (key) => {
                return (
                  <th>
                    <button
                      type="button"
                      onClick={() => requestSort(key)}
                      className={getClassNamesFor(key)}
                    >
                      {key}
                    </button>
                  </th>
                )
              })}
              <th>
                <p>snapshot</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {!_.isEmpty(data) && data.map((item, i) => (
              <tr key={i}>
                <td>{item.user_id}</td>
                <td>{item.first_area_of_the_day}</td>
                <td>{item.first_area_timestamp}</td>
                <td>{item.last_area_of_the_day}</td>
                <td>{item.last_area_timestamp}</td>
                <td><img src={item.snapshot} alt="X" /></td>
              </tr>
            ))}

          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
}