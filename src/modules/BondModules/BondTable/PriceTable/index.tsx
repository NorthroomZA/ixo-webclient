import React, { Fragment } from 'react'
import { useTable } from 'react-table'
import moment from 'moment'
import {
  StyledTableHeader,
  StyledTableCell,
  StyledTableRow,
  DateContainer,
  StyledMobileRow,
  StyledMobileBuyCell,
  StyledDateWrapper,
  StyledAmountWrapper,
  TBodyContainer,
  StyledOptionCell,
} from './index.style'
import ValueComponent from './ValueComponent'
import { useWindowSize } from 'common/hooks'
import { thousandSeparator } from 'common/utils/formatters'

interface TableProps {
  columns: object
  data: object[]
}

const renderCell = (cell: any): any => {
  if (cell.column.id === 'date') {
    const status = cell.row.original.status
    return (
      <DateContainer>
        <span className={status}></span>
        <span>{moment.utc(cell.value).format('DD MMM YY')}</span>
        <span>{moment.utc(cell.value).format('HH:mm')}</span>
      </DateContainer>
    )
  } else if (cell.column.id === 'buySell' && cell.column.Header === 'STAKING') {
    return 'Send'
  } else if (cell.column.id === 'buySell') {
    return cell.value ? 'Buy' : 'Sell'
  } else if (cell.column.id === 'option') {
    return (
      <StyledOptionCell
        {...cell.getCellProps()}
        header={cell.column.id}
        option={cell.value}
      >
        {cell.value}
      </StyledOptionCell>
    )
  } else if (cell.column.id === 'quantity') {
    return thousandSeparator(cell.value, ',')
  } else if (cell.column.id === 'value') {
    const status = cell.row.original.status
    return (
      <ValueComponent
        value={{
          status: status,
          value: cell.value.value,
          txhash: cell.value.txhash,
          denom: cell.row.original.denom,
          log: cell.value.log,
        }}
      />
    )
  } else {
    return cell.render('Cell')
  }
}

const renderDesktopTableRow = (row): any => (
  <StyledTableRow {...row.getRowProps()}>
    {row.cells.map((cell) => {
      return (
        <StyledTableCell
          key={cell.column.id}
          {...cell.getCellProps()}
          header={cell.column.id}
          type={!!cell.value}
        >
          {renderCell(cell)}
        </StyledTableCell>
      )
    })}
  </StyledTableRow>
)

const renderMobileTableRow = (row): any => {
  return (
    <StyledMobileRow {...row.getRowProps()}>
      <StyledMobileBuyCell
        header={row.cells[1].column.id}
        type={row.cells[1].value}
      >
        {renderCell(row.cells[1])}
      </StyledMobileBuyCell>
      <div className="d-flex text-white">
        <StyledAmountWrapper>
          <span className="mr-5">{renderCell(row.cells[2])}</span>
          <span>Quantity</span>
        </StyledAmountWrapper>
        <StyledAmountWrapper>
          <span>{renderCell(row.cells[3])}</span>
          <span>Price</span>
        </StyledAmountWrapper>
      </div>
      <StyledDateWrapper>
        <span>{renderCell(row.cells[0])}</span>
        <span>{renderCell(row.cells[4])}</span>
      </StyledDateWrapper>
    </StyledMobileRow>
  )
}

const Table: React.SFC<TableProps> = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  })
  const size = useWindowSize()
  const updatedRows = rows.map(function (val, key) {
    val.key = `table-row-${key}`
    return val
  })

  return (
    <>
      <table {...getTableProps()}>
        {size.width > 1024 && (
          <thead>
            {headerGroups.map((headerGroup, groupIndex) => (
              <tr key={groupIndex} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // eslint-disable-next-line react/jsx-key
                  <StyledTableHeader {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </StyledTableHeader>
                ))}
              </tr>
            ))}
          </thead>
        )}
      </table>
      <TBodyContainer>
        <div {...getTableBodyProps()}>
          {updatedRows.map((item, key) => {
            prepareRow(item)
            return (
              <Fragment key={`table-body-${key}`}>
                {size.width > 1024 && renderDesktopTableRow(item)}
                {size.width <= 1024 && renderMobileTableRow(item)}
              </Fragment>
            )
          })}
        </div>
      </TBodyContainer>
    </>
  )
}

export default Table
