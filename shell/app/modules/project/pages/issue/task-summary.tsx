// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import React from 'react';
import DiceConfigPage from 'app/config-page';
import { getUrlQuery } from 'config-page/utils';
import { updateSearch } from 'common/utils';
import routeInfoStore from 'core/stores/route';

const TaskSummary = () => {
  const [{ projectId }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [urlQuery, setUrlQuery] = React.useState(query);

  React.useEffect(() => {
    updateSearch({ ...urlQuery });
  }, [urlQuery]);

  const inParams = { projectId, ...urlQuery };

  const urlQueryChange = (val: Obj) => setUrlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));

  return (
    <div>
      <DiceConfigPage
        scenarioType={'requirement-task-overview'}
        scenarioKey={'requirement-task-overview'}
        inParams={inParams}
        customProps={{
          topFilter: {
            op: {
              onFilterChange: urlQueryChange,
            },
            props: {
              className: 'flex justify-end',
            },
          },
          chartBlock: {
            props: {
              className: 'bg-white',
            },
          },
          stackChartBlock: {
            props: {
              className: 'bg-white',
            },
          },
          container: {
            props: {
              className: 'bg-white',
              leftProportion: 3,
              rightProportion: 7,
            },
          },
          simpleChart: {
            props: {
              style: {
                height: '144px',
              },
            },
          },
        }}
      />
    </div>
  );
};

export default TaskSummary;
