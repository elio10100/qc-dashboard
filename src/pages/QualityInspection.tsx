import React, { useState } from "react"
import { format } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover"
import { Calendar } from "../components/ui/calendar"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PieController } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, PieController)

export default function QualityInspection() {
  const [formData, setFormData] = useState({
    date: new Date(),
    location: "",
    inspector: "",
    product: "",
    grower: "",
    type: "",
    totalBoxes: "",
    lot: "",
    temperature: "",
    notes: "",
    quality1: "",
    quality2: "",
    defects: [{ name: "", count: "" }],
    pti: ""
  })
  const [images, setImages] = useState<{ name: string; files: File[] }[]>([])
  const [showNext, setShowNext] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [login, setLogin] = useState({ username: "", password: "" })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLogin((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = () => {
    if (login.username === "eliomolina" && login.password === "minemine") {
      setAuthenticated(true)
    } else {
      alert("Incorrect username or password")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDefectChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.defects]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, defects: updated }
    })
  }

  const handleAddDefect = () => {
    setFormData((prev) => ({
      ...prev,
      defects: [...prev.defects, { name: "", count: "" }],
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files)
    setImages((prev) => {
      const existing = prev.find((img) => img.name === label)
      if (existing) {
        return prev.map((img) =>
          img.name === label ? { ...img, files: [...img.files, ...newFiles] } : img
        )
      } else {
        return [...prev, { name: label, files: newFiles }]
      }
    })
  }

  const calculatePercentages = () => {
    const q1 = parseFloat(formData.quality1) || 0
    const q2 = parseFloat(formData.quality2) || 0
    const total = q1 + q2
    const totalDefects = formData.defects.reduce((sum, d) => sum + (parseFloat(d.count) || 0), 0)
    const q1Percent = total ? ((q1 / total) * 100).toFixed(1) : "0"
    const q2Percent = total ? ((q2 / total) * 100).toFixed(1) : "0"

    const defectPiePercents = formData.defects.map((d) => {
      const count = parseFloat(d.count) || 0
      return total ? (count / total * 100).toFixed(1) : "0"
    })

    return {
      q1Percent,
      q2Percent,
      defectPercents: formData.defects.map((d) => {
        const count = parseFloat(d.count) || 0
        return totalDefects ? (((count / totalDefects) * parseFloat(q2Percent))).toFixed(1) : "0"
      }),
      pieChartLabels: ["Quality #1", ...formData.defects.map(d => d.name)],
      pieChartData: [parseFloat(q1Percent), ...formData.defects.map((d, i) => parseFloat(defectPiePercents[i]))]
    }
  }

  const handleContinue = () => setShowNext(true)

  const generatePDF = async () => {
    // existing generatePDF logic
  }

  const { q1Percent, q2Percent } = calculatePercentages()

  if (!authenticated) {
    return (
      <div className="p-4 space-y-4 max-w-xs mx-auto">
        <Label>Username</Label>
        <Input name="username" onChange={handleLoginChange} />
        <Label>Password</Label>
        <Input type="password" name="password" onChange={handleLoginChange} />
        <Button onClick={handleLoginSubmit}>Login</Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{format(formData.date, "PPP")}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input placeholder="Location" name="location" value={formData.location} onChange={handleChange} />
        <Input placeholder="Inspector" name="inspector" value={formData.inspector} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Product" name="product" value={formData.product} onChange={handleChange} />
        <Input placeholder="Grower" name="grower" value={formData.grower} onChange={handleChange} />
        <Input placeholder="Type" name="type" value={formData.type} onChange={handleChange} />
        <Input placeholder="Total Boxes" name="totalBoxes" value={formData.totalBoxes} onChange={handleChange} />
        <Input placeholder="Lot #" name="lot" value={formData.lot} onChange={handleChange} />
        <Input placeholder="Temperature" name="temperature" value={formData.temperature} onChange={handleChange} />
      </div>

      <Textarea placeholder="Notes" name="notes" value={formData.notes} onChange={handleChange} />

      <div className="flex gap-4">
        <Input placeholder="Quality #1" name="quality1" value={formData.quality1} onChange={handleChange} />
        <Input placeholder="Quality #2" name="quality2" value={formData.quality2} onChange={handleChange} />
      </div>

      {formData.quality1 && formData.quality2 && (
        <p className="text-sm text-gray-600">Category #1: {q1Percent}% &nbsp;&nbsp; Category #2: {q2Percent}%</p>
      )}

      {!showNext && (
        <Button className="mt-2" onClick={handleContinue}>Save and Continue</Button>
      )}

      {showNext && (
        <>
          {formData.defects.map((defect, index) => (
            <div key={index} className="flex gap-2">
              <Input placeholder="Defect Name" value={defect.name} onChange={(e) => handleDefectChange(index, "name", e.target.value)} />
              <Input placeholder="Count" value={defect.count} onChange={(e) => handleDefectChange(index, "count", e.target.value)} />
            </div>
          ))}
          <Button onClick={handleAddDefect}>Add Defect</Button>
          <Input placeholder="PTI" name="pti" value={formData.pti} onChange={handleChange} />
          <div>
            <Label>Category #1 Photos</Label>
            <Input type="file" multiple onChange={(e) => handleImageUpload(e, "Category #1")} />
            <Label>PTI Photos</Label>
            <Input type="file" multiple onChange={(e) => handleImageUpload(e, "PTI")} />
            {formData.defects.map((defect, index) => (
              <div key={index}>
                <Label>{defect.name} Photos</Label>
                <Input type="file" multiple onChange={(e) => handleImageUpload(e, defect.name)} />
              </div>
            ))}
          </div>
          <Button onClick={generatePDF}>Generate PDF</Button>
        </>
      )}
    </div>
  )
}
