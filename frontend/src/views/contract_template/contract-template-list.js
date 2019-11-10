import { connect } from "react-redux";
import { contractTemplatesSelector } from "../../api/actions";
import { ContractTemplatesList } from "../../components/contract-templates-list";

export const ConnectedContractTemplateList = connect(state => ({
    contractTemplates: contractTemplatesSelector(state)
}))(ContractTemplatesList);
