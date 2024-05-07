const React = require("react");
const PropTypes = require("prop-types");

const Navigation = require("../navigation.js");

class Table extends React.Component {
  handleChange = evt => {
    this.props.onChange({
      target: {
        name: evt.target.name,
        value: parseInt(evt.target.value, 10),
      },
    });
  };

  _renderHead() {
    return <thead>
      <tr>
        {this.props.columns.map(column => <th
          key={`${this.props.name}-${column.key}`}
          className={column.className || ""}
        >
          {column.label}
        </th>)}
      </tr>
    </thead>;
  }

  _renderBody() {
    return <tbody>
      {this.props.rows.map(row => <tr
        key={`${this.props.name}-${row.id}`}
        className={this.props.rowClassFn && this.props.rowClassFn(row)}
      >
        {this.props.columns.map(column => <td
          key={`${this.props.name}-${row.id}-${column.key}`}
        >
          {column.render
            ? column.render(row)
            : row[column.key]}
        </td>)}
      </tr>)}
    </tbody>;
  }

  render() {
    return <>
      <Navigation
        limit={this.props.limit}
        page={this.props.page}
        count={this.props.count}
        onChange={this.handleChange}
      >
        {this.props.navigationLeft}
      </Navigation>
      <div className={`table-container ${this.props.tableClassName}`}>
        <table className="table is-bordered is-fullwidth">
          {this._renderHead()}
          {this._renderBody()}
        </table>
      </div>
    </>;
  }
}
Table.displayName = "Table";
Table.propTypes = {
  columns: PropTypes.array.isRequired,
  count: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  navigationLeft: PropTypes.node,
  page: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  rowClassFn: PropTypes.func,
  rows: PropTypes.array.isRequired,
  tableClassName: PropTypes.string,
};
Table.defaultProps = {
  navigationLeft: undefined,
  onChange: undefined,
  rowClassFn: undefined,
  tableClassName: "",
};

module.exports = Table;
