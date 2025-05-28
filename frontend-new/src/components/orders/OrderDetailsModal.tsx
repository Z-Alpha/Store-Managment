import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Order } from '../../features/orders/orderSlice';

interface OrderDetailsModalProps {
  order?: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
  if (!order) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Order Details - {order.orderNumber}
                    </Dialog.Title>
                    <div className="mt-6 space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Customer Information
                        </h4>
                        <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                            <dd className="text-sm text-gray-900">
                              {order.customer.name}
                            </dd>
                          </div>
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-sm text-gray-900">
                              {order.customer.email}
                            </dd>
                          </div>
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="text-sm text-gray-900">
                              {order.customer.phone}
                            </dd>
                          </div>
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">
                              Address
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {order.customer.address}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Order Items
                        </h4>
                        <div className="mt-2">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                >
                                  Product
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Quantity
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Price
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {order.items.map((item, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
                                    {item.product}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {item.quantity}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    ${item.price.toFixed(2)}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    ${item.total.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <th
                                  scope="row"
                                  colSpan={3}
                                  className="pl-4 pr-3 pt-4 text-right text-sm font-semibold text-gray-900 sm:pl-0"
                                >
                                  Total Amount
                                </th>
                                <td className="pl-3 pr-4 pt-4 text-right text-sm font-semibold text-gray-900">
                                  ${order.totalAmount.toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Order Status
                        </h4>
                        <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">
                              Order Status
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </dd>
                          </div>
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">
                              Payment Status
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {order.paymentStatus.charAt(0).toUpperCase() +
                                order.paymentStatus.slice(1)}
                            </dd>
                          </div>
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">
                              Shipping Method
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {order.shippingMethod}
                            </dd>
                          </div>
                          <div className="flex justify-between py-3">
                            <dt className="text-sm font-medium text-gray-500">
                              Order Date
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default OrderDetailsModal; 