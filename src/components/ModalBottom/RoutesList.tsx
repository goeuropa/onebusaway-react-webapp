import React from "react";
import styled from "styled-components";
import { Placeholder, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { shallowEqual } from "react-redux";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { dispatchModalInfoBottomIsOpen, setLoadingAction } from "../../redux/actions";
import { routeListButtonWidth } from "../../config";
import { cutAgencyName } from "../../utils/helpers";

const RoutesListContainer = styled.div`
  width: 100%;
  padding-bottom: 10px;
`;

const RoutesList = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const dispatch: Dispatch = useAppDispatch();

  const [agencyId, listFromRedux, routeNumberFromRedux, allRoutesTableFromRedux]: [
    string,
    number[],
    number | string,
    RouteInfo[]
  ] = useAppSelector(
    (state: RootState) => [
      state?.agency?.agencyId,
      state?.list.list,
      state?.agency?.routeNumber,
      state?.allData?.allRoutesTableReduced,
    ],
    shallowEqual
  );
  // console.log("allRoutesTableFromRedux:", allRoutesTableFromRedux);

  const [list, setList] = React.useState<string[] | null>(null);
  const [routeNumber, setRouteNumber] = React.useState<string | number>("");
  const [routesInfoArray, setRoutesInfoArray] = React.useState<RouteInfo[] | null>(null);
  // console.log("routesInfoArray:", routesInfoArray);

  React.useEffect(() => {
    if (list && list.length === 1) {
      //* IIFE
      (async () => {
        // await console.info(list[0]);
        await dispatch(dispatchModalInfoBottomIsOpen(true));
        await navigate(`/app/route/${list[0]}`);
      })();
    }
  }, [dispatch, list, navigate]);

  React.useEffect(() => {
    if (allRoutesTableFromRedux && list && agencyId) {
      let routesArray = [] as RouteInfo[];
      for (let i = 0; i < list.length; i++) {
        for (let k = 0; k < allRoutesTableFromRedux.length; k++) {
          if (list[i] === cutAgencyName(allRoutesTableFromRedux[k].id, agencyId)) {
            const lineObject = {
              fromList: list[i],
              ...allRoutesTableFromRedux[k],
            };
            routesArray.push(lineObject);
          }
        }
      }
      // console.log("routesArray:", routesArray);

      if (agencyId === ("13" as string)) {
        routesArray.sort((a, b) => (a.shortName as string).localeCompare(b.shortName as string));
      }
      if (agencyId === ("2362" as string)) {
        routesArray.sort((a, b) => (a.fromList as string).localeCompare(b.fromList as string));
      }

      setRoutesInfoArray(routesArray);
    }
  }, [agencyId, allRoutesTableFromRedux, list]);

  React.useEffect(() => {
    if (listFromRedux) {
      const stringsList = listFromRedux.map((elem) => String(elem));
      setList(stringsList);
    }
  }, [listFromRedux]);

  React.useEffect(() => {
    if (routeNumberFromRedux) {
      setRouteNumber(routeNumberFromRedux);
    } else {
      setRouteNumber("routeUnset");
    }
  }, [routeNumberFromRedux]);

  const setCurrentRoute = async (line: number | string) => {
    // console.log({ line });
    // console.log({ routeNumber });
    await dispatch(dispatchModalInfoBottomIsOpen(true));
    await localStorage.setItem("line", JSON.stringify(line));
    await dispatch(setLoadingAction(true));
    await navigate(`/app/route/${line}`);
  };

  const RoutesListTable = (): JSX.Element => {
    return (
      <Table hover={true} striped={true} bordered={false} size="sm">
        <thead style={{ position: "sticky", top: "0", background: "lightgray", zIndex: 9 }}>
          <tr>
            <th style={{ fontSize: "small", textAlign: "center", width: routeListButtonWidth }}>{t("Route")}</th>
            <th style={{ fontSize: "small", textAlign: "center" }}>{t("Direction / Headsign")}</th>
          </tr>
        </thead>
        <tbody>
          {routesInfoArray &&
            routesInfoArray.length >= 1 &&
            routesInfoArray.map((route: RouteInfo) => {
              return (
                <tr
                  key={route.id}
                  onClick={() => setCurrentRoute(route.fromList!)}
                  style={{ cursor: "pointer", background: route.fromList === routeNumber ? "lightgray" : "" }}
                >
                  <td
                    style={{
                      color: `#${route.textColor}`,
                      backgroundColor: `#${route.color}`,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                    className="th_small_padding span_bold"
                  >
                    {route.shortName || route.fromList!}{" "}
                  </td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }} className="th_small_padding">
                    {route.longName}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    );
  };

  //* Animated Placeholder
  const AnimatedPlaceholder = (): JSX.Element => {
    const SinglePlaceHolder = (i: number): JSX.Element => (
      <Placeholder animation={i % 2 === 0 ? "wave" : "glow"} key={i}>
        <Placeholder xs={12} size="lg" bg={i % 2 === 0 ? "secondary" : "light"} />
      </Placeholder>
    );

    const placeholdersNumber = list && list.length;
    // console.log({ placeholdersNumber });

    const placeHoldersArray = [] as JSX.Element[];
    for (let i = 0; i < placeholdersNumber!; i++) {
      placeHoldersArray.push(SinglePlaceHolder(i));
    }
    return <React.Fragment>{placeholdersNumber && placeHoldersArray}</React.Fragment>;
  };

  return (
    <React.Fragment>
      <RoutesListContainer>
        {routesInfoArray && routesInfoArray.length >= 1 ? RoutesListTable() : AnimatedPlaceholder()}
      </RoutesListContainer>
    </React.Fragment>
  );
};

export default RoutesList;
