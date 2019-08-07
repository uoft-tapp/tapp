import React from 'react';
import { connect } from "react-redux";
import { Formik, Field, Form } from 'formik';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { upsertSession } from "../../api/actions"

function CustomDatePicker({field, form, ...props}) {
  return (
    <DatePicker 
      selected={field.value} 
      onChange={(date) => {form.setFieldValue(field.name, date)}}
      {...props}
    />
  )
};

function LabeledField(props) {
  const { label, type, name, ...rest } = props
  return (
    <div>
      <label>{label}</label>
      <Field type={type} name={name} {...rest}/>
  </div>
  )
}

class SessionCreator extends React.Component {
  render() {
    return (
      <div>
        <h1>Create a new session</h1>
        <Formik 
          initialValues={{name: '', rate1: '', rate2: '', start_date: new Date(), end_date: new Date(), id: ''}}
          onSubmit={(values) => {
            console.log(values);
            this.props.upsertSession(values)
          }}
          render={() => ( 
            <Form>
              <LabeledField label="Session Name:" type="text" name="name"/>
              <LabeledField label="Rate 1:" type="number" name="rate1"/>
              <LabeledField label="Rate 2:" type="number" name="rate2"/>
              <LabeledField label="Start Date:" type="date" name="start_date" component={CustomDatePicker}/>
              <LabeledField label="End Date:" type="date" name="end_date" component={CustomDatePicker}/>
              <button type="submit">Submit</button>
            </Form>
          )}
        />
      </div>
    );
  }
};

export default connect (
  () => ({}),
  { upsertSession }
)(SessionCreator)