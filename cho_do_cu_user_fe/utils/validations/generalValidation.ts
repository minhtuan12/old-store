import {isValidEmail, isValidPassword, isValidPhone} from "../helper";
import _ from "lodash";

interface IGeneralKeys {
    username?: string,
    firstname?: string,
    lastname?: string,
    email?: string,
    password?: string,
    phone?: string
}

export const validate = (
    data: IGeneralKeys,
    errors: IGeneralKeys,
    type: string
):
    {
        isError: boolean,
        error: IGeneralKeys
    } => {
    let error = false
    let errorData = _.cloneDeep(errors);

    switch (type) {
        case 'username':
            if (!data.username || data.username?.length === 0) {
                errorData.username = 'Tên tài khoản không được bỏ trống!';
                error = true;
            } else {
                errorData.username = '';
            }
            break;
        case 'firstname':
            if (!data.firstname || data.firstname?.length === 0) {
                errorData.firstname = 'Họ không được bỏ trống!';
                error = true;
            } else {
                errorData.firstname = '';
            }
            break;
        case 'lastname':
            if (!data.lastname || data.lastname?.length === 0) {
                errorData.lastname = 'Tên không được bỏ trống!';
                error = true;
            } else {
                errorData.lastname = '';
            }
            break;
        case 'email':
            if (!data.email || data.email?.length === 0) {
                errorData.email = 'Email không được bỏ trống!';
                error = true;
            } else if (!isValidEmail(data.email)) {
                errorData.email = 'Email không đúng định dạng!';
                error = true;
            } else if (data.email?.length > 200) {
                errorData.email = 'Kí tự tối đa cho phép là 200 kí tự!';
                error = true;
            } else {
                errorData.email = '';
            }
            break;
        case 'phone':
            if (data.phone) {
                if (!isValidPhone(data.phone)) {
                    errorData.phone = 'Số điện thoại không đúng định dạng!';
                    error = true;
                } else {
                    errorData.phone = '';
                }
            }
            break;
        case 'password':
            if (data.password === '') {
                errorData.password = 'Mật khẩu không được bỏ trống!';
                error = true;
            } else if (data.password && !isValidPassword(data.password)) {
                errorData.password = 'Mật khẩu ít nhất 8 kí tự, chứa kí tự viết hoa, số, kí tự đặc biệt và không có khoảng trống!';
                error = true;
            } else {
                errorData.password = '';
            }
            break;
    }

    return {
        isError: error,
        error: errorData,
    }
}
