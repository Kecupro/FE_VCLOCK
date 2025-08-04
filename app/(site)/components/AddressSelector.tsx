import { useEffect, useState, useRef } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

export interface Province {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  phone_code: string;
}

export interface District {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  district_code: string;
}


export default function AddressSelector({ value, onChange }: {
  value?: string;
  onChange: (fullAddress: string) => void;
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState("");

  // Sử dụng useRef để lưu trữ onChange function và tránh vòng lặp vô hạn
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sử dụng ref để theo dõi việc đã parse value chưa
  const hasParsedValue = useRef(false);

  // Sử dụng ref để lưu trữ giá trị cuối cùng đã gửi ra ngoài
  const lastSentValue = useRef('');

  // Reset hasParsedValue khi value thay đổi
  useEffect(() => {
    hasParsedValue.current = false;
    lastSentValue.current = ''; // Reset lastSentValue khi value thay đổi
  }, [value]);

  useEffect(() => {
    fetch("https://bevclock-production.up.railway.app/api/provinces")
      .then(res => res.json())
      .then(setProvinces);
  }, []);

  useEffect(() => {
    if (province) {
      fetch(`https://bevclock-production.up.railway.app/api/districts/${province}`)
        .then(res => res.json())
        .then(setDistricts);
      // Reset district và ward khi province thay đổi
      setDistrict('');
      setWard('');
      setWards([]);
    } else {
      setDistricts([]);
      setDistrict('');
      setWard('');
      setWards([]);
    }
  }, [province]);

  useEffect(() => {
    if (district) {
      fetch(`https://bevclock-production.up.railway.app/api/wards/${district}`)
        .then(res => res.json())
        .then(setWards);
      // Reset ward khi district thay đổi
      setWard('');
    } else {
      setWards([]);
      setWard('');
    }
  }, [district]);

  // Parse value prop to set initial state
  useEffect(() => {
    if (value && provinces.length > 0 && !hasParsedValue.current) {
      const addressParts = value.split(', ').reverse(); // Reverse to get [province, district, ward, street]
      
      // Find province
      const provinceName = addressParts[0];
      const foundProvince = provinces.find(p => p.name === provinceName);
      if (foundProvince) {
        setProvince(foundProvince.code);
      }
      
      // Đánh dấu đã parse để tránh chạy lại
      hasParsedValue.current = true;
    }
  }, [value, provinces]); // Chỉ phụ thuộc vào value và provinces

  // Parse district và ward sau khi có districts và wards
  useEffect(() => {
    if (value && districts.length > 0 && hasParsedValue.current) {
      const addressParts = value.split(', ').reverse();
      const districtName = addressParts[1];
      if (districtName) {
        const foundDistrict = districts.find(d => d.name === districtName);
        if (foundDistrict) {
          setDistrict(foundDistrict.code);
        }
      }
    }
  }, [value, districts]);

  useEffect(() => {
    if (value && wards.length > 0 && hasParsedValue.current) {
      const addressParts = value.split(', ').reverse();
      const wardName = addressParts[2];
      if (wardName) {
        const foundWard = wards.find(w => w.name === wardName);
        if (foundWard) {
          setWard(foundWard.code);
        }
      }
      
      // Set street address
      const streetAddress = addressParts.slice(3).reverse().join(', ');
      if (streetAddress) {
        setStreet(streetAddress);
      }
    }
  }, [value, wards]);

  // Xóa useEffect trùng lặp này
  // useEffect(() => {
  //   const p = provinces.find(p => p.code === province)?.name || '';
  //   const d = districts.find(d => d.code === district)?.name || '';
  //   const w = wards.find(w => w.code === ward)?.name || '';
  //   const full = [w, d, p].filter(Boolean).join(', ');
  //   onChange(full); // Cập nhật ra ngoài
  // }, [province, district, ward, onChange]);

    // Dropdown component
    const Dropdown = ({
    items,
    selected,
    setSelected,
    placeholder,
    }: {
    items: { name: string; code: string }[];
    selected: { name: string; code: string } | null;
    setSelected: (value: { name: string; code: string } | null) => void;
    placeholder: string;
    }) => (
    <Listbox value={selected} onChange={setSelected}>
        <div className="relative w-full">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 hover:border-red-300">
            <span className="block truncate text-gray-800">{selected ? selected.name : placeholder}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
        </Listbox.Button>
        <Listbox.Options 
            className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            static={false}
        >
            {items.map((item) => (
            <Listbox.Option
                key={item.code}
                className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-10 pr-4 transition ${
                    active ? "bg-red-100 text-red-700" : "text-gray-900"
                }`
                }
                value={item}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
            >
                {({ selected }) => (
                <>
                    <span className={`block truncate ${selected ? "font-semibold text-red-600" : "font-normal"}`}>
                    {item.name}
                    </span>
                    {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600">
                        ✔
                    </span>
                    )}
                </>
                )}
            </Listbox.Option>
            ))}
        </Listbox.Options>
        </div>
    </Listbox>
    );

  useEffect(() => {
    const p = provinces.find((p) => p.code === province)?.name || "";
    const d = districts.find((d) => d.code === district)?.name || "";
    const w = wards.find((w) => w.code === ward)?.name || "";
    const full = [street, w, d, p].filter(Boolean).join(", ");
    
    // Chỉ gọi onChange khi giá trị thực sự thay đổi
    if (full !== lastSentValue.current) {
      lastSentValue.current = full;
      onChangeRef.current(full);
    }
  }, [province, district, ward, street, provinces, districts, wards]); // Thêm dependencies

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Dropdown
           items={provinces}
           selected={provinces.find((p) => p.code === province) || null}
           setSelected={(p) => p ? setProvince(p.code) : setProvince('')}
           placeholder="Chọn tỉnh"
         />

         <Dropdown
           items={districts}
           selected={districts.find((d) => d.code === district) || null}
           setSelected={(d) => d ? setDistrict(d.code) : setDistrict('')}
           placeholder="Chọn huyện"
         />

         <Dropdown
           items={wards}
           selected={wards.find((w) => w.code === ward) || null}
           setSelected={(w) => w ? setWard(w.code) : setWard('')}
           placeholder="Chọn xã"
         />
      </div>

      <input
        type="text"
        placeholder="Số nhà, tên đường (VD: 123 Lý Thường Kiệt, Block A2)"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
      />
    </div>
  );
}
