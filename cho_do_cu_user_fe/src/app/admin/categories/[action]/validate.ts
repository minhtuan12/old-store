import {Attribute, Category} from "../../../../../utils/types";
import {ADDABLE_INPUT_TYPE} from "../../../../../utils/constants";
import {countDuplicateValue} from "../../../../../utils/helper";

export const submitValidation = (data: Category) => {
    let isError = false, errorDetail = {
        name: '',
        attribute: {
            label: '',
            initialValues: ''
        }
    }

    if (!data.name) {
        isError = true
        errorDetail = {
            ...errorDetail,
            name: 'Tên danh mục không được bỏ trống!'
        }
    }

    if (data.attributes?.length > 0) {
        const attributes: Attribute[] = data.attributes

        /* No attribute label */
        const attributeHasNoLabel = attributes.some((item: Attribute) => !item.label)
        if (attributeHasNoLabel) {
            isError = true
            errorDetail = {
                ...errorDetail,
                attribute: {
                    ...errorDetail.attribute,
                    label: `Tên thuộc tính không được bỏ trống!`
                }
            }
        }

        /* No initial values with addable input */
        const hasAddableInputTypeAndLabelButNoValues = attributes.some(
            (item: Attribute) =>
                ADDABLE_INPUT_TYPE.includes(item.input_type)
                && item.label
                && (!item.initial_value || item.initial_value?.filter(value => value !== '')?.length === 0)
        )
        if (hasAddableInputTypeAndLabelButNoValues) {
            isError = true
            errorDetail = {
                ...errorDetail,
                attribute: {
                    ...errorDetail.attribute,
                    initialValues: 'Các lựa chọn của thuộc tính đã điền tên không được bỏ trống!'
                }
            }
        }

        /* Duplicate attribute label */
        const duplicateLabels: string[] = countDuplicateValue(data.attributes, 'label')
        if (duplicateLabels?.length > 0) {
            isError = true
            errorDetail = {
                ...errorDetail,
                attribute: {
                    ...errorDetail.attribute,
                    label: `Thuộc tính ${duplicateLabels.join(', ')} đang bị lặp lại!`
                }
            }
        }
    }

    return {isError, errorDetail}
}
