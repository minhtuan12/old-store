import {AxiosResponse} from "axios";
import {apiAxios} from "@/api/callApi";
import {Category, Filter} from "../../utils/types";

export const requestGetCategoriesForAdmin = async (filter: Filter): Promise<AxiosResponse> => {
    const {q, page, pageSize, column, sortOrder}: Filter = filter
    let query: string = `?page=${page}&page_size=${pageSize}`
    if (q) {
        query += `&q=${q}`
    }
    if (column) {
        query += `&column=${column}`
    }
    if (sortOrder) {
        query += `&sort_order=${sortOrder}`
    }
    return apiAxios({
        method: 'get',
        url: `admin/categories${query}`
    })
}

export const requestGetPublicCategories = async (): Promise<AxiosResponse> => {
    return apiAxios({
        method: 'get',
        url: 'public/categories'
    })
}

export const requestGetAttributesOfCategory = async (categoryId: string): Promise<AxiosResponse> => {
    return apiAxios({
        method: 'get',
        url: `public/categories/${categoryId}/attributes`
    })
}

export const requestGetCategoryById = async (categoryId: string) => {
    return apiAxios({
        method: 'get',
        url: `admin/category/${categoryId}`
    })
}


export const requestCreateCategory = async (category: Category) => {
    return apiAxios({
        method: 'post',
        url: 'admin/category',
        data: category
    })
}

export const requestUpdateCategory = async (categoryId: string, category: Category) => {
    return apiAxios({
        method: 'put',
        url: `admin/categories/${categoryId}`,
        data: category
    })
}

export const requestHideOrShowCategory = async (categoryId: string, type: string) => {
    return apiAxios({
        method: 'patch',
        url: `admin/categories/${categoryId}`,
        data: {type}
    })
}
