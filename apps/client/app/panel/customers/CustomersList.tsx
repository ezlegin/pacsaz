import { deleteCustomer } from "@/actions/customer";
import DeleteButton from "@/components/DeleteButton";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { Customer } from "@repo/db";
import ActionButton from "@/components/ActionButton";
import { DialogTitle } from "@repo/ui/components/dialog";
import { Mail, MapPin, Pencil, Phone, Users } from "lucide-react";
import { EmptyState, PanelCard, SectionHeader } from "../components/PanelUI";

const CustomersList = ({ data }: { data: Customer[] }) => {
  return (
    <PanelCard>
      <SectionHeader
        icon={Users}
        title="لیست مشتری‌ها"
        description="مشتریانی که برای پروژه‌هایشان قالب ذخیره می‌کنی"
      />

      {data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="هنوز مشتری‌ای اضافه نکرده‌ای"
          description="با ثبت مشتری می‌توانی قالب‌های ذخیره‌شده را به هر مشتری نسبت بدهی و پروژه‌ها را مرتب نگه داری."
        />
      ) : (
        <>
          {/* ------------------------ desktop table ------------------------ */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  {["نام و نام خانوادگی", "شماره تماس", "ایمیل", "آدرس", ""].map(
                    (label, index) => (
                      <th
                        key={index}
                        className={
                          index === 0
                            ? "px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground"
                            : "px-4 py-3 text-center text-[11px] font-semibold text-muted-foreground"
                        }
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-primary/[0.03]"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
                          {customer.fullName.trim().charAt(0)}
                        </span>
                        <span className="text-xs font-bold">
                          {customer.fullName}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center text-xs">
                      <span
                        dir="ltr"
                        className="inline-block text-muted-foreground"
                      >
                        {customer.phoneNumber ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center text-xs">
                      <span
                        dir="ltr"
                        className="inline-block text-muted-foreground"
                      >
                        {customer.email ?? "—"}
                      </span>
                    </td>

                    <td className="max-w-64 px-4 py-3.5 text-center text-xs text-muted-foreground">
                      <span className="line-clamp-1">
                        {customer.address ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <ActionButton icon={Pencil}>
                          <DialogTitle>ویرایش مشتری</DialogTitle>
                          <CustomerForm type="update" customer={customer} />
                        </ActionButton>
                        <DeleteButton
                          deleteFn={deleteCustomer}
                          id={customer.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ------------------------- mobile cards ------------------------ */}
          <ul className="divide-y md:hidden">
            {data.map((customer) => (
              <li key={customer.id} className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                      {customer.fullName.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">
                        {customer.fullName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        مشتری
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ActionButton icon={Pencil}>
                      <DialogTitle>ویرایش مشتری</DialogTitle>
                      <CustomerForm type="update" customer={customer} />
                    </ActionButton>
                    <DeleteButton deleteFn={deleteCustomer} id={customer.id} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  {customer.phoneNumber && (
                    <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Phone className="size-3.5 text-primary" />
                      <span dir="ltr">{customer.phoneNumber}</span>
                    </p>
                  )}
                  {customer.email && (
                    <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Mail className="size-3.5 text-primary" />
                      <span dir="ltr">{customer.email}</span>
                    </p>
                  )}
                  {customer.address && (
                    <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {customer.address}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </PanelCard>
  );
};

export default CustomersList;
