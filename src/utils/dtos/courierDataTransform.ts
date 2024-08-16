// Provided API response interfaces
interface CustomerData {
    customer_id: number;
    customer_number: string;
    successful_delivery: number;
    total_delivery: number;
    fraud_level: number;
    fraud_count: number;
    fraud_reason: string | null;
    customer_email: string | null;
    customer_country_id: number;
    customer_country_name: string;
}

interface PathaoData {
    message: string;
    type: string;
    code: number;
    data: {
        success_rate: number;
        fraud_level: number;
        fraud_count: number;
        fraud_reason: string;
        is_new: boolean;
        address_book: any[];
        customer?: CustomerData;
    };
}

interface CourierData {
    total: number;
    delivered: number;
    returned: number;
    successRatio: string;
}

// Function to transform the data into an object
export const courierDataTransform = (
    response: any,
): Record<string, CourierData> => {
    const { redx, steadfast, pathao, paperfly } = response as {
        redx: {
            code: number;
            isError: boolean;
            message: string;
            data: {
                totalParcels: string;
                deliveredParcels: string;
                returnPercentage: string;
                customerSegment: string;
            };
        };
        steadfast: { code: number; data: [number, number, any[]] };
        pathao: PathaoData;
        paperfly: {
            draw: number;
            page: null;
            limit: number;
            totalFiltered: number;
            totalRecords: number;
            records: {
                customer_name: string;
                customer_phone: string;
                delivered: string;
                returned: string;
            }[];
            code: number;
        };
    };

    // Calculate for each courier
    const redxTotal = parseInt(redx.data.totalParcels);
    const redxDelivered = parseInt(redx.data.deliveredParcels);
    const redxReturned = redxTotal - redxDelivered;

    const steadfastTotal = steadfast.data[0] + steadfast.data[1];
    const steadfastDelivered = steadfast.data[0];
    const steadfastReturned = steadfast.data[1];

    // Pathao calculations
    const pathaoTotal = pathao.data.customer
        ? pathao.data.customer.total_delivery
        : 0;
    const pathaoDelivered = pathao.data.customer
        ? pathao.data.customer.successful_delivery
        : 0;
    const pathaoReturned = pathaoTotal - pathaoDelivered;

    const paperflyTotal =
        paperfly.records.reduce(
            (acc: number, record: any) =>
                acc + parseInt(record.delivered as string),
            0,
        ) +
        paperfly.records.reduce(
            (acc: number, record: any) =>
                acc + parseInt(record.returned as string),
            0,
        );
    const paperflyDelivered = paperfly.records.reduce(
        (acc: number, record: any) =>
            acc + parseInt(record.delivered as string),
        0,
    );
    const paperflyReturned = paperfly.records.reduce(
        (acc: number, record: any) => acc + parseInt(record.returned as string),
        0,
    );

    // Total calculations
    const totalTotal = redxTotal + steadfastTotal + pathaoTotal + paperflyTotal;
    const totalDelivered =
        redxDelivered +
        steadfastDelivered +
        pathaoDelivered +
        paperflyDelivered;
    const totalReturned = totalTotal - totalDelivered;

    // Calculate success ratio
    const calculateSuccessRatio = (delivered: number, total: number) => {
        return total > 0
            ? `${((delivered / total) * 100).toFixed(2)} %`
            : "New Customer 100%";
    };

    // Create an object with courier names as keys
    const couriersData: Record<string, CourierData> = {
        Pathao: {
            total: pathaoTotal,
            delivered: pathaoDelivered,
            returned: pathaoReturned,
            successRatio: calculateSuccessRatio(pathaoDelivered, pathaoTotal),
        },
        Steadfast: {
            total: steadfastTotal,
            delivered: steadfastDelivered,
            returned: steadfastReturned,
            successRatio: calculateSuccessRatio(
                steadfastDelivered,
                steadfastTotal,
            ),
        },
        Redx: {
            total: redxTotal,
            delivered: redxDelivered,
            returned: redxReturned,
            successRatio: calculateSuccessRatio(redxDelivered, redxTotal),
        },
        Paperfly: {
            total: paperflyTotal,
            delivered: paperflyDelivered,
            returned: paperflyReturned,
            successRatio: calculateSuccessRatio(
                paperflyDelivered,
                paperflyTotal,
            ),
        },
        Total: {
            total: totalTotal,
            delivered: totalDelivered,
            returned: totalReturned,
            successRatio: calculateSuccessRatio(totalDelivered, totalTotal),
        },
    };

    return couriersData;
};
