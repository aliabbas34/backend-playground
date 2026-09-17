
interface PaginationOffset {
  skip: number;
  take: number;
}

/**
 * Calculates Database pagination parameters (skip and take) from 1-based page numbers.
 */
export function getPaginationOffset(
  page: number,
  limit: number,
  defaultLimit = 10
): PaginationOffset {
    const pageValue = Math.max(1, page || 1);
    const take = Math.max(1, limit || defaultLimit);
    const skip = (pageValue - 1) * take;

    return { skip, take };
}