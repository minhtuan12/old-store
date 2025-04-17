import {Filter} from "./types";
import {PER_PAGE} from "./constants";

export const initialFilter: Filter = {
    page: 1,
    pageSize: PER_PAGE,
    q: '',
    sortOrder: -1,
    column: 'createdAt'
}
