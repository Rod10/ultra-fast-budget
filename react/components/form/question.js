const React = require("react");

const PropTypes = require("prop-types");
const Checkbox = require("../bulma/checkbox.js");
const Radio = require("../bulma/radio.js");

class RenderQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      response: [],
      default: true,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeRadio = this.handleChangeRadio.bind(this);
    this.initState = this.initState.bind(this);

    this.handleQuizzNext = this.handleQuizzNext.bind(this);
    this._renderQuizzNext = this._renderQuizzNext.bind(this);
  }

  componentDidMount() {
    this.initState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentQuestion !== this.props.currentQuestion) {
      this.initState();
    }
  }

  initState() {
    const _response = {};
    for (let i = 0; i < this.props.answer.length; i++) {
      _response[i] = false;
    }
    this.setState({response: _response});
  }

  handleQuizzNext() {
    const _question = this.props.question;
    const _type = this.props.type;

    if (typeof this.props.onNext === "undefined") {
      throw new Error("Missing required props");
    }
    this.props.onNext({
      id: _question.id,
      question: _question.questionText,
      type: _type,
      response: this.state.response,
    });
    this.setState({default: true});
  }

  handleChange(e) {
    const pos1 = e.target.name.lastIndexOf("[");
    const pos2 = e.target.name.lastIndexOf("]");
    const id = parseInt(e.target.name.substring(pos1 + 1, pos2), 10);
    const value = e.target.value;

    this.setState(prevState => {
      const newState = {...prevState};
      newState.response[id] = value;
      if (typeof this.props.onChange !== "undefined") {
        this.props.onChange(newState, this.props.currentQuestion);
      }
      return {response: newState.response, default: false};
    });
  }

  handleChangeRadio(e) {
    this.initState();

    const pos1 = e.target.name.lastIndexOf("[");
    const pos2 = e.target.name.lastIndexOf("]");
    const id = parseInt(e.target.name.substring(pos1 + 1, pos2), 10);
    const value = e.target.checked;

    this.setState(prevState => {
      const newState = {...prevState};
      newState.response[id] = value;
      if (typeof this.props.onChange !== "undefined") {
        this.props.onChange(newState, this.props.currentQuestion);
      }
      return {response: newState.response, default: false};
    });
  }

  _renderQuizzNext() {
    if (this.props.currentQuestion === this.props.quizz.questionNumber) {
      return null;
    }
    if (typeof this.props.onNext === "undefined") {
      return null;
    }
    return (
      <div className="control has-text-centered">
        <button type="button" className="button is-warning" onClick={this.handleQuizzNext} disabled={this.state.default}>
          <b>Question suivante</b>
          <span className="icon is-small">
            <i className="fa fa-arrow-right " />
          </span>
        </button>
      </div>
    );
  }

  renderGoodAnswer() {
    const type = this.props.type;
    const answer = this.props.answer;

    if (type === "shortanswer") {
      return (
        <div>
          <input
            className="input"
            defaultValue={answer ? answer[0].text : ""}
            disabled
          />
        </div>
      );
    }
  }

  renderArticle() {
    const currentQuestion = this.props.currentQuestion;
    const answer = this.props.answerlist[currentQuestion].answers;
    const disabled = this.props.disabled;

    if (!disabled) {
      return null;
    }

    let res = true;

    for (let i = 0; i < answer.length; i++) {
      const checked = typeof answer[i].checked === "undefined" ? false : answer[i].checked;

      if (typeof answer[i].checked === "string") {
        if (answer[i].checked !== answer[i].text) {
          res = false;
        }
      } else {
        if (parseFloat(answer[i].fraction) > 0.0 && checked === false) {
          res = false;
        }
        if (parseFloat(answer[i].fraction) === 0.0 && checked === true) {
          res = false;
        }
      }
    }
    if (res) { // On prepare les bonne réponses
      return (
        <article className="message is-success">
          <div className="message-body">
            Bonne réponse 😎
          </div>
        </article>
      );
    }
    return (
      <article className="message is-danger">
        <div className="message-body">
          <span>Mauvaise réponse</span>
          {this.renderGoodAnswer()}
        </div>
      </article>
    );
  }

  getClassAnswer(answer) {
    if (answer.fraction > 0) {
      return "is-green";
    }
    return "is-red";
  }

  /* eslint-disable-next-line max-lines-per-function */
  render() {
    const type = this.props.question.type;
    const answer = this.props.answer;
    const disabled = this.props.disabled;
    const currentQuestion = this.props.currentQuestion;
    const hasResponse = this.props.answerlist.length > currentQuestion;

    switch (type) {
    case "shortanswer":
      return (
        <span>
          {this.renderArticle()}
          <input
            className="input"
            name={`response[${currentQuestion}][0]`}
            placeholder="Votre réponse"
            value={hasResponse ? this.props.answerlist[currentQuestion].answers[0].checked : ""}
            onChange={this.handleChange}
            disabled={disabled}
          />
          <br />
          {this._renderQuizzNext()}
        </span>
      );
    case "multichoice":
      return (
        <div>
          {this.renderArticle()}
          {
            answer.map((ans, i) => <div
              key={ans.key}
              className={disabled ? this.getClassAnswer(ans) : null}
            >
              <Checkbox
                name={`response[${currentQuestion}][${i}]`}
                text={ans.text.replace("&nbsp;", "")}
                checked={hasResponse
                  ? this.props.answerlist[currentQuestion].answers[i].checked : this.state.response[i]}
                onChange={this.handleChange}
                disabled={disabled}
              />
            </div>)
          }
          <br />
          {this._renderQuizzNext()}
        </div>
      );
    case "truefalse":
      return (
        <div onChange={this.handleChangeRadio}>
          {this.renderArticle()}
          {
            answer.map((ans, i) => <div
              key={ans.key}
              className={disabled ? this.getClassAnswer(ans) : null}
            >
              <Radio
                name={`response[${currentQuestion}][${i}]`}
                text={ans.text.replace("&nbsp;", "")}
                checked={hasResponse
                  ? this.props.answerlist[currentQuestion].answers[i].checked : this.state.response[i]}
                disabled={disabled}
              />
            </div>)
          }
          <br />
          {this._renderQuizzNext()}
        </div>
      );
    default:
      return (
        {type}
      );
    }
  }
}

RenderQuestion.displayName = "RenderQuestion";
RenderQuestion.propTypes = {
  type: PropTypes.string.isRequired,
  question: PropTypes.object.isRequired,
  answer: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onNext: PropTypes.func,
  currentQuestion: PropTypes.number.isRequired,
  quizz: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  answerlist: PropTypes.array.isRequired,
};
RenderQuestion.defaultProps = {
  disabled: undefined,
  onChange: undefined,
};
RenderQuestion.defaultState = {
  questionId: undefined,
  questionText: undefined,
  questionType: undefined,
  answer: undefined,
  disabled: false,
  default: false,
};

module.exports = RenderQuestion;
