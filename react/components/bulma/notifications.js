const React = require("react");

const NotificationCmp = require("./notification.js");

// 3 seconds
const AUTO_CLOSE_DELAI = 3000;

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUnusedId: 0,
      notifications: [],
    };

    this.doRemoveNotification = this.doRemoveNotification.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.handleRemoveNotification = this.handleRemoveNotification.bind(this);
  }

  componentDidMount() {
    Notifications.addNotification = this.addNotification;
  }

  doRemoveNotification(id) {
    return this.setState(prevState => ({
      notifications: prevState.notifications
        .filter(e => e.id !== id),
    }));
  }

  addNotification(type, content, autoClose = true) {
    this.setState(prevState => {
      if (autoClose) {
        setTimeout(() => this.doRemoveNotification(prevState.lastUnusedId), AUTO_CLOSE_DELAI);
      }
      return {
        lastUnusedId: prevState.lastUnusedId + 1,
        notifications: prevState.notifications.concat({type, content, id: prevState.lastUnusedId}),
      };
    });
  }

  handleRemoveNotification(evt) {
    let el = evt.target;
    while (!el.dataset.id) {
      el = el.parentElement;
    }
    const id = parseInt(el.dataset.id, 10);
    this.doRemoveNotification(id);
  }

  render() {
    return <div className="notifications-container">
      {this.state.notifications.map(e => <NotificationCmp
        key={e.id}
        type={e.type}
        data-id={e.id}
      >
        <button
          type="button"
          className="delete"
          onClick={this.handleRemoveNotification}
        />
        {e.content}
      </NotificationCmp>)}
    </div>;
  }
}
Notifications.displayName = "Notifications";

module.exports = Notifications;
